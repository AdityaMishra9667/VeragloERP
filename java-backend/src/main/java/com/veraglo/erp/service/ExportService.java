package com.veraglo.erp.service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import org.springframework.stereotype.Service;

/** Server-side PDF generation (OpenPDF). */
@Service
public class ExportService {

    public byte[] samplePdf(String title, String body) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph(title));
            document.add(new Paragraph(body));
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("PDF generation failed", e);
        }
    }
}
