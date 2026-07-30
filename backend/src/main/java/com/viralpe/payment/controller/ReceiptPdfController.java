package com.viralpe.payment.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/receipt")
@CrossOrigin(origins = "*")
public class ReceiptPdfController {

    @GetMapping(value = "/pdf/{referenceId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getReceiptPdf(
            @PathVariable String referenceId,
            @RequestParam(defaultValue = "239.00") String amount,
            @RequestParam(defaultValue = "Recharge") String operator,
            @RequestParam(defaultValue = "User") String name,
            @RequestParam(defaultValue = "560001") String pincode
    ) {
        String textContent = String.format(
                "VIRALPE WALLET NETWORK - OFFICIAL RECEIPT\n" +
                "================================================\n" +
                "Status           : SUCCESS\n" +
                "Amount           : Rs %s\n" +
                "Operator / Type  : %s\n" +
                "Reference ID     : %s\n" +
                "------------------------------------------------\n" +
                "Member Name      : %s\n" +
                "Pincode          : %s\n" +
                "================================================\n" +
                "Thank you for using ViralPe Wallet Network!\n",
                amount, operator, referenceId, name, pincode
        );

        String streamText = "BT /F1 12 Tf 16 TL 40 750 Td\n";
        String[] lines = textContent.split("\n");
        for (int i = 0; i < lines.length; i++) {
            String safeLine = lines[i].replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
            if (i == 0) {
                streamText += "(" + safeLine + ") Tj\n";
            } else {
                streamText += "T* (" + safeLine + ") Tj\n";
            }
        }
        streamText += "ET";

        byte[] streamBytes = streamText.getBytes(StandardCharsets.UTF_8);

        String pdfStringHeader =
                "%PDF-1.4\n" +
                "1 0 obj\n" +
                "<< /Type /Catalog /Pages 2 0 R >>\n" +
                "endobj\n" +
                "2 0 obj\n" +
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
                "endobj\n" +
                "3 0 obj\n" +
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\n" +
                "endobj\n" +
                "4 0 obj\n" +
                "<< /Length " + streamBytes.length + " >>\n" +
                "stream\n" +
                streamText + "\n" +
                "endstream\n" +
                "endobj\n" +
                "5 0 obj\n" +
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n" +
                "endobj\n" +
                "xref\n" +
                "0 6\n" +
                "0000000000 65535 f \n" +
                "0000000009 00000 n \n" +
                "0000000058 00000 n \n" +
                "0000000115 00000 n \n" +
                "0000000250 00000 n \n" +
                "0000000355 00000 n \n" +
                "trailer\n" +
                "<< /Size 6 /Root 1 0 R >>\n" +
                "startxref\n" +
                (450 + streamBytes.length) + "\n" +
                "%%EOF";

        byte[] pdfBytes = pdfStringHeader.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "ViralPe_Receipt_" + referenceId + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
