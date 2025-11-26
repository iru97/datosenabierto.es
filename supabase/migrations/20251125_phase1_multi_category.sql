-- ============================================
-- MIGRATION: Phase 1 - Multi-Category Classification
-- Date: 2025-11-25
-- Description: Enable multiple categories per document with confidence scores
-- ============================================

-- ============================================
-- 1. MULTI-CATEGORY SUPPORT
-- ============================================

CREATE TABLE IF NOT EXISTS documento_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES documentos_boe(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  clasificacion_metodo VARCHAR(20) NOT NULL CHECK (clasificacion_metodo IN ('rule', 'keyword', 'llm', 'legacy')),
  razonamiento TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(documento_id, categoria_id)
);

-- Indexes for performance
CREATE INDEX idx_doc_cat_documento ON documento_categorias(documento_id);
CREATE INDEX idx_doc_cat_categoria ON documento_categorias(categoria_id);
CREATE INDEX idx_doc_cat_confidence ON documento_categorias(confidence DESC);
CREATE INDEX idx_doc_cat_metodo ON documento_categorias(clasificacion_metodo);

-- ============================================
-- 2. CLASSIFICATION FEEDBACK
-- ============================================

CREATE TABLE IF NOT EXISTS classification_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id UUID NOT NULL REFERENCES documentos_boe(id),
  clasificacion_id UUID REFERENCES documento_categorias(id) ON DELETE CASCADE,
  correcto BOOLEAN NOT NULL,
  categoria_correcta UUID REFERENCES categorias(id),
  comentario TEXT,
  revisor_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_documento ON classification_feedback(documento_id);
CREATE INDEX idx_feedback_correcto ON classification_feedback(correcto);
CREATE INDEX idx_feedback_created ON classification_feedback(created_at DESC);

-- ============================================
-- 3. CLASSIFICATION METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS classification_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  periodo VARCHAR(10) NOT NULL, -- 'YYYY-WW' format

  -- Confusion matrix
  true_positives INT DEFAULT 0,
  false_positives INT DEFAULT 0,
  false_negatives INT DEFAULT 0,
  true_negatives INT DEFAULT 0,

  -- Calculated metrics
  metric_precision DECIMAL(5,4),
  metric_recall DECIMAL(5,4),
  metric_f1_score DECIMAL(5,4),

  -- Method breakdown
  metodo_rule_count INT DEFAULT 0,
  metodo_keyword_count INT DEFAULT 0,
  metodo_llm_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(categoria_id, periodo)
);

CREATE INDEX idx_metrics_categoria ON classification_metrics(categoria_id);
CREATE INDEX idx_metrics_periodo ON classification_metrics(periodo DESC);
CREATE INDEX idx_metrics_f1 ON classification_metrics(metric_f1_score DESC);

-- ============================================
-- 4. MIGRATE EXISTING DATA
-- ============================================

-- Migrate existing single-category assignments to multi-category table
INSERT INTO documento_categorias (documento_id, categoria_id, confidence, clasificacion_metodo, razonamiento)
SELECT
  id,
  categoria_id,
  1.0,
  'legacy',
  'Migrated from original categoria_id field'
FROM documentos_boe
WHERE categoria_id IS NOT NULL
ON CONFLICT (documento_id, categoria_id) DO NOTHING;

-- ============================================
-- 5. HELPER VIEWS
-- ============================================

-- View for backward compatibility: Get primary category per document
CREATE OR REPLACE VIEW documentos_con_categoria_principal AS
SELECT
  d.*,
  dc.categoria_id,
  dc.confidence,
  dc.clasificacion_metodo
FROM documentos_boe d
LEFT JOIN LATERAL (
  SELECT categoria_id, confidence, clasificacion_metodo
  FROM documento_categorias
  WHERE documento_id = d.id
  ORDER BY confidence DESC
  LIMIT 1
) dc ON TRUE;

-- View to get all categories per document
CREATE OR REPLACE VIEW documentos_con_todas_categorias AS
SELECT
  d.id as documento_id,
  d.titulo,
  d.fecha_publicacion,
  json_agg(
    json_build_object(
      'categoria_id', c.id,
      'categoria_slug', c.slug,
      'categoria_nombre', c.nombre,
      'confidence', dc.confidence,
      'metodo', dc.clasificacion_metodo
    ) ORDER BY dc.confidence DESC
  ) as categorias
FROM documentos_boe d
LEFT JOIN documento_categorias dc ON d.id = dc.documento_id
LEFT JOIN categorias c ON dc.categoria_id = c.id
WHERE dc.id IS NOT NULL
GROUP BY d.id, d.titulo, d.fecha_publicacion;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to get primary category for a document
CREATE OR REPLACE FUNCTION get_primary_categoria(doc_id UUID)
RETURNS UUID AS $$
  SELECT categoria_id
  FROM documento_categorias
  WHERE documento_id = doc_id
  ORDER BY confidence DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to calculate classification metrics for a period
CREATE OR REPLACE FUNCTION calculate_classification_metrics(
  p_categoria_id UUID,
  p_periodo VARCHAR(10)
)
RETURNS TABLE(
  metric_precision DECIMAL(5,4),
  metric_recall DECIMAL(5,4),
  metric_f1_score DECIMAL(5,4)
) AS $$
DECLARE
  tp INT;
  fp INT;
  fn INT;
  prec DECIMAL(5,4);
  rec DECIMAL(5,4);
  f1 DECIMAL(5,4);
BEGIN
  -- Get confusion matrix values from feedback
  SELECT
    COUNT(*) FILTER (WHERE cf.correcto = true AND dc.categoria_id = p_categoria_id),
    COUNT(*) FILTER (WHERE cf.correcto = false AND dc.categoria_id = p_categoria_id),
    COUNT(*) FILTER (WHERE cf.categoria_correcta = p_categoria_id AND dc.categoria_id != p_categoria_id)
  INTO tp, fp, fn
  FROM classification_feedback cf
  LEFT JOIN documento_categorias dc ON cf.clasificacion_id = dc.id
  WHERE cf.created_at >= to_date(p_periodo || '-1', 'IYYY-IW-ID')
    AND cf.created_at < to_date(p_periodo || '-1', 'IYYY-IW-ID') + INTERVAL '1 week';

  -- Calculate metrics
  IF (tp + fp) > 0 THEN
    prec := tp::DECIMAL / (tp + fp);
  ELSE
    prec := 0;
  END IF;

  IF (tp + fn) > 0 THEN
    rec := tp::DECIMAL / (tp + fn);
  ELSE
    rec := 0;
  END IF;

  IF (prec + rec) > 0 THEN
    f1 := 2 * (prec * rec) / (prec + rec);
  ELSE
    f1 := 0;
  END IF;

  RETURN QUERY SELECT prec, rec, f1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON TABLE documento_categorias IS 'Multi-category classification with confidence scores';
COMMENT ON COLUMN documento_categorias.confidence IS 'Confidence score 0-1, where 1 is highest confidence';
COMMENT ON COLUMN documento_categorias.clasificacion_metodo IS 'Method used: rule, keyword, llm, or legacy';
COMMENT ON COLUMN documento_categorias.razonamiento IS 'Explanation for classification (especially for LLM method)';

COMMENT ON TABLE classification_feedback IS 'Human validation of automatic classifications';
COMMENT ON TABLE classification_metrics IS 'Weekly precision/recall/F1 metrics per category';

COMMENT ON VIEW documentos_con_categoria_principal IS 'Backward compatible view showing primary category per document';
COMMENT ON VIEW documentos_con_todas_categorias IS 'All categories per document as JSON array';

-- ============================================
-- 8. VERIFICATION
-- ============================================

-- Count migrated records
DO $$
DECLARE
  migrated_count INT;
  original_count INT;
BEGIN
  SELECT COUNT(*) INTO migrated_count FROM documento_categorias WHERE clasificacion_metodo = 'legacy';
  SELECT COUNT(*) INTO original_count FROM documentos_boe WHERE categoria_id IS NOT NULL;

  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  Original records: %', original_count;
  RAISE NOTICE '  Migrated records: %', migrated_count;

  IF migrated_count != original_count THEN
    RAISE WARNING 'Migration count mismatch! Expected %, got %', original_count, migrated_count;
  END IF;
END $$;
