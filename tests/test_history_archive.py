"""
Tests for Field Intelligence History Archive redesign.
Verifies structure, elements, pagination, filtering, search, and detail presentation.
"""
from pathlib import Path
import re
import unittest
from edge_server import app


class TestHistoryArchive(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.root = Path(__file__).resolve().parent.parent
        cls.html = (cls.root / "frontend" / "index.html").read_text(encoding="utf-8")
        cls.js = (cls.root / "frontend" / "js" / "app.js").read_text(encoding="utf-8")
        cls.css = (cls.root / "frontend" / "css" / "main.css").read_text(encoding="utf-8")

    def test_history_header_structure(self):
        """Header contains overline HISTORY, title Field intelligence history, and total count."""
        self.assertIn('data-i18n="history_overline">HISTORY</p>', self.html)
        self.assertIn('data-i18n="history_archive_title">Field intelligence history</h1>', self.html)
        self.assertIn('id="historyTotalCount"', self.html)
        self.assertIn('data-i18n="history_archive_subtitle">Review saved disease, pest, field, crop and soil analyses from this device.</p>', self.html)

    def test_history_search_input(self):
        """Search input has the required placeholder and clear button."""
        self.assertIn('id="historySearchInput"', self.html)
        self.assertIn('placeholder="Search pest, disease, crop, field or analysis..."', self.html)
        self.assertIn('id="historySearchClear"', self.html)

    def test_history_filters_and_sort(self):
        """Filter buttons for all categories, date range select, and sort control exist."""
        self.assertIn('data-history-type="all"', self.html)
        self.assertIn('data-history-type="disease"', self.html)
        self.assertIn('data-history-type="pest"', self.html)
        self.assertIn('data-history-type="field_intelligence"', self.html)
        self.assertIn('data-history-type="crop"', self.html)

        self.assertIn('id="historyDateFilter"', self.html)
        self.assertIn('value="all"', self.html)
        self.assertIn('value="today"', self.html)
        self.assertIn('value="week"', self.html)
        self.assertIn('value="month"', self.html)

        self.assertIn('id="historySortSelect"', self.html)
        self.assertIn('value="newest"', self.html)
        self.assertIn('value="oldest"', self.html)

    def test_history_summary_strip(self):
        """Summary strip displays total, pest, disease, field, crop counts."""
        self.assertIn('id="historySummaryStrip"', self.html)
        self.assertIn('id="summaryTotal"', self.html)
        self.assertIn('id="summaryPest"', self.html)
        self.assertIn('id="summaryDisease"', self.html)
        self.assertIn('id="summaryField"', self.html)
        self.assertIn('id="summaryCrop"', self.html)

    def test_history_pagination_controls(self):
        """Pagination controls exist with previous, numbered container, and next."""
        self.assertIn('id="historyPagination"', self.html)
        self.assertIn('id="historyPrevBtn"', self.html)
        self.assertIn('id="historyPageNumbers"', self.html)
        self.assertIn('id="historyNextBtn"', self.html)

    def test_history_page_size_is_strictly_five(self):
        """Ensure page size is strictly set to 5 records per page."""
        self.assertIn("HISTORY_PAGE_SIZE = 5", self.js)

    def test_history_search_and_filtering_logic(self):
        """JavaScript includes filtering, searching, and sorting functions."""
        self.assertIn("function matchesHistorySearch", self.js)
        self.assertIn("function matchesHistoryDate", self.js)
        self.assertIn("function getFilteredAnalyses", self.js)
        self.assertIn("function updateHistorySummaryStrip", self.js)
        self.assertIn("function renderAnalysesPage", self.js)
        self.assertIn("function renderHistoryPagination", self.js)

    def test_history_record_card_formatting(self):
        """Card renderer formats type label, timestamp, mode pill, context, and view link."""
        self.assertIn("function renderHistoryRecordCard", self.js)
        self.assertIn("record-header-row", self.js)
        self.assertIn("record-body-row", self.js)
        self.assertIn("record-footer-row", self.js)
        self.assertIn("record-action-row", self.js)
        self.assertIn("view_analysis_affordance", self.js)
        self.assertIn("PEST SCREENING", self.js)
        self.assertIn("DISEASE DETECTION", self.js)
        self.assertIn("FIELD INTELLIGENCE", self.js)
        self.assertIn("CROP RECOMMENDATION", self.js)

    def test_history_detail_and_collapsible_technical_details(self):
        """Detail renderer has structured sections, TTS, and collapsible technical details."""
        self.assertIn("function showAnalysisDetail", self.js)
        self.assertIn("renderHistoryDiseaseDetail", self.js)
        self.assertIn("renderHistoryPestDetail", self.js)
        self.assertIn("renderHistoryFieldIntelligenceDetail", self.js)
        self.assertIn("renderHistoryCropDetail", self.js)
        self.assertIn("technical-details", self.js)
        self.assertIn('document.createElement("details")', self.js)
        self.assertIn("tech-json", self.js)

    def test_backend_analyses_endpoint_intact(self):
        """Verify GET /api/analyses returns 200 with stored records list."""
        resp = self.client.get("/api/analyses")
        self.assertEqual(resp.status_code, 200)
        data = resp.json
        self.assertIsInstance(data, list)
        if len(data) > 0:
            item_id = data[0]["id"]
            detail_resp = self.client.get(f"/api/analyses/{item_id}")
            self.assertEqual(detail_resp.status_code, 200)
            self.assertEqual(detail_resp.json["id"], item_id)


    def test_history_modal_markup_and_library_layout(self):
        """History page has library container and modal overlay structure."""
        # Main page contains library container, not permanently visible detail panel
        self.assertIn('class="history-library-container"', self.html)
        self.assertIn('id="analysisList"', self.html)
        self.assertNotIn('class="history-detail-panel"', self.html)

        # Modal overlay and dialog structure
        self.assertIn('id="historyModalOverlay"', self.html)
        self.assertIn('id="historyModalBackdrop"', self.html)
        self.assertIn('id="historyModalType"', self.html)
        self.assertIn('id="historyModalMode"', self.html)
        self.assertIn('id="historyModalTitle"', self.html)
        self.assertIn('id="historyModalMeta"', self.html)
        self.assertIn('id="historyModalListenBtn"', self.html)
        self.assertIn('id="historyModalCloseBtn"', self.html)

        # Modal navigation bar
        self.assertIn('id="historyModalNavPos"', self.html)
        self.assertIn('id="historyModalPrevBtn"', self.html)
        self.assertIn('id="historyModalNextBtn"', self.html)

        # Modal scrollable body
        self.assertIn('id="analysisDetail"', self.html)
        self.assertIn('class="history-modal-body"', self.html)

    def test_history_modal_scripts_and_events(self):
        """JavaScript contains modal lifecycle, navigation, and keyboard handlers."""
        self.assertIn("function openAnalysisModal", self.js)
        self.assertIn("function closeAnalysisModal", self.js)
        self.assertIn("function updateModalNav", self.js)
        self.assertIn("modal-open", self.js)
        self.assertIn('"Escape"', self.js)
        self.assertIn("historyModalBackdrop", self.js)
        self.assertIn("historyModalCloseBtn", self.js)
        self.assertIn("historyModalPrevBtn", self.js)
        self.assertIn("historyModalNextBtn", self.js)

    def test_global_text_caret_fix(self):
        """CSS includes global fix preventing blinking text caret on non-editable text."""
        self.assertIn("caret-color: transparent !important;", self.css)
        self.assertIn("caret-color: auto !important;", self.css)
        self.assertIn("[contenteditable", self.css)

    def test_history_modal_image_contained_presentation(self):
        """Image inside History modal must have contained presentation, no zoom/stretch/crop, and neutral background."""
        # CSS checks for contained image presentation
        self.assertIn(".modal-image-wrap", self.css)
        self.assertIn("object-fit: contain;", self.css)
        self.assertIn("width: 100%;", self.css)
        self.assertIn("height: auto;", self.css)
        self.assertIn("transform: none !important;", self.css)
        self.assertIn("background: var(--surface-soft);", self.css)
        # Ensure object-fit: cover is NOT applied to modal-analysis-image
        self.assertNotIn(".modal-analysis-image {\n  object-fit: cover", self.css)

    def test_confidence_formatting_no_nan(self):
        """Confidence formatting function exists, displays percentages, and displays Confidence unavailable instead of NaN%."""
        self.assertIn("function formatConfidenceValue", self.js)
        self.assertIn('"Confidence unavailable"', self.js)
        self.assertNotIn('NaN%', self.js)


if __name__ == "__main__":
    unittest.main()
