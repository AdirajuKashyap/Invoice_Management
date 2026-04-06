from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER

from datetime import timedelta
import os


def get_full_path(relative_path):
    """Convert relative path to full path"""
    if not relative_path:
        return None
    if os.path.isabs(relative_path):
        return relative_path
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    return os.path.join(backend_dir, relative_path)


def generate_invoice_pdf(invoice, company=None, user=None):
    file_path = f"invoices/invoice_{invoice.id}.pdf"
    os.makedirs("invoices", exist_ok=True)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    # =========================
    # COLORS
    # =========================
    DARK_BLUE = colors.HexColor("#1e3a5f")
    LIGHT_GRAY = colors.HexColor("#e8e8e8")
    MEDIUM_GRAY = colors.HexColor("#6b7280")
    DARK_GRAY = colors.HexColor("#374151")
    ORANGE = colors.HexColor("#f97316")

    # =========================
    # STYLES (PREMIUM TYPOGRAPHY)
    # =========================
    title_style = ParagraphStyle(
        name="Title",
        fontSize=28,
        fontName="Helvetica-Bold",
        alignment=TA_RIGHT,
        textColor=DARK_BLUE
    )

    company_style = ParagraphStyle(
        name="Company",
        fontSize=16,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#111827")
    )

    label_style = ParagraphStyle(
        name="Label",
        fontSize=9,
        textColor=colors.HexColor("#6b7280")
    )

    value_style = ParagraphStyle(
        name="Value",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.black
    )

    bold_value = ParagraphStyle(
        name="BoldValue",
        fontSize=11,
        fontName="Helvetica-Bold",
        textColor=colors.black
    )

    footer_style = ParagraphStyle(
        name="Footer",
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#9ca3af")
    )

    normal_style = ParagraphStyle(
        name="Normal",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.black
    )

    section_header_style = ParagraphStyle(
        name="SectionHeader",
        fontSize=12,
        fontName="Helvetica-Bold",
        textColor=DARK_BLUE
    )

    table_header_style = ParagraphStyle(
        name="TableHeader",
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        name="TableCell",
        fontSize=10,
        fontName="Helvetica",
        textColor=colors.black
    )

    comments_header_style = ParagraphStyle(
        name="CommentsHeader",
        fontSize=12,
        fontName="Helvetica-Bold",
        textColor=DARK_BLUE
    )

    total_label_style = ParagraphStyle(
        name="TotalLabel",
        fontSize=10,
        fontName="Helvetica",
        textColor=DARK_GRAY
    )

    total_value_style = ParagraphStyle(
        name="TotalValue",
        fontSize=10,
        fontName="Helvetica",
        textColor=DARK_GRAY
    )

    thank_you_style = ParagraphStyle(
        name="ThankYou",
        fontSize=14,
        fontName="Helvetica-Bold",
        textColor=ORANGE,
        alignment=TA_CENTER
    )

    elements = []

    company_name = company.name if company else "Your Company"
    client = invoice.client

    # =========================
    # TOP HEADER - LOGO + COMPANY INFO + INVOICE
    # =========================
    # Left side - Client Logo (if exists) or placeholder
    logo_cell = None
    if client and client.logo_path:
        logo_full_path = get_full_path(client.logo_path)
        if logo_full_path and os.path.exists(logo_full_path):
            try:
                logo_cell = Image(logo_full_path, width=1.2*inch, height=0.8*inch)
            except Exception as e:
                print(f"Error loading client logo: {e}")
    
    # If no logo, show placeholder box
    if not logo_cell:
        logo_cell = Paragraph(
            "<font color='white'><b>Logo</b></font>",
            ParagraphStyle(name="LogoPlaceholder", fontSize=10, fontName="Helvetica-Bold", textColor=colors.white, alignment=TA_CENTER)
        )
        logo_box = Table([[logo_cell]], colWidths=[1*inch], rowHeights=[0.8*inch])
        logo_box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), DARK_BLUE),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        logo_cell = logo_box
    else:
        # Wrap logo in table for alignment
        logo_box = Table([[logo_cell]], colWidths=[1.2*inch])
        logo_box.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        logo_cell = logo_box

    # Company name and address (real data or empty)
    company_phone = company.phone if company and hasattr(company, 'phone') and company.phone else ""
    company_email = company.email if company and hasattr(company, 'email') and company.email else ""
    company_address_line = company.address if company and hasattr(company, 'address') and company.address else ""
    company_city = f"{company.city}, {company.state} {company.pincode}" if company and hasattr(company, 'city') and company.city else ""
    
    company_info = f"""
        <font size=16 color='#1e3a5f'><b>{company_name}</b></font><br/>
        {f"<font size=9 color='#6b7280'>{company_address_line}</font><br/>" if company_address_line else ""}
        {f"<font size=9 color='#6b7280'>{company_city}</font><br/>" if company_city else ""}
        {f"<font size=9 color='#6b7280'>{company_phone}</font><br/>" if company_phone else ""}
        {f"<font size=9 color='#6b7280'>{company_email}</font><br/>" if company_email else ""}
        """.strip()
    
    company_address = Paragraph(company_info, normal_style)

    # Right side - INVOICE title with meta
    due_date = invoice.created_at + timedelta(days=30)
    invoice_meta = Paragraph(
        f"""
        <font size=24 color='#1e3a5f'><b>INVOICE</b></font><br/><br/>
        <font color='#6b7280'>Date</font> <font color='#374151'>{invoice.created_at.strftime('%Y-%m-%d')}</font><br/>
        <font color='#6b7280'>Invoice #</font> <font color='#374151'>[{invoice.id}]</font><br/>
        <font color='#6b7280'>Due Date</font> <font color='#374151'>{due_date.strftime('%Y-%m-%d')}</font>
        """,
        normal_style
    )

    # Header with logo, company info, and invoice meta
    header_table = Table(
        [[logo_cell, company_address, invoice_meta]],
        colWidths=[1.2*inch, 2.8*inch, 3*inch]
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (2, 0), (2, 0), "RIGHT"),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 30))

    # =========================
    # BILL TO + SHIP TO (SIDE BY SIDE)
    # =========================
    bill_to_header = Paragraph("<font color='white'><b>BILL TO</b></font>", section_header_style)
    ship_to_header = Paragraph("<font color='white'><b>SHIP TO</b></font>", section_header_style)

    client_info_parts = [f"<font color='#374151'><b>{client.name}</b></font>"]
    if client.email:
        client_info_parts.append(f"<font color='#6b7280'>{client.email}</font>")
    if client.address:
        client_info_parts.append(f"<font color='#6b7280'>{client.address}</font>")
    if client.city:
        city_str = f"{client.city}"
        if client.state:
            city_str += f", {client.state}"
        if client.pincode:
            city_str += f" {client.pincode}"
        client_info_parts.append(f"<font color='#6b7280'>{city_str}</font>")
    if client.phone:
        client_info_parts.append(f"<font color='#6b7280'>{client.phone}</font>")
    
    client_info = "<br/>".join(client_info_parts)
    bill_to_content = Paragraph(client_info, normal_style)
    ship_to_content = Paragraph(client_info, normal_style)

    bill_ship_table = Table([
        [bill_to_header, ship_to_header],
        [bill_to_content, ship_to_content]
    ], colWidths=[3.25*inch, 3.25*inch])

    bill_ship_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BLUE),
        ("LEFTPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("BOX", (0, 0), (-1, -1), 1, LIGHT_GRAY),
        ("LEFTPADDING", (0, 1), (-1, 1), 8),
        ("TOPPADDING", (0, 1), (-1, 1), 8),
    ]))

    elements.append(bill_ship_table)
    elements.append(Spacer(1, 20))

    # =========================
    # ITEMS TABLE (Dark Blue Header + Gray Rows)
    # =========================
    table_data = [[
        Paragraph("Description", table_header_style),
        Paragraph("Qty", table_header_style),
        Paragraph("Unit Price", table_header_style),
        Paragraph("Amount", table_header_style)
    ]]

    # ✅ ACTUAL ITEMS LOOP (FIXED)
    for item in invoice.items:
        table_data.append([
            Paragraph(str(item.product or ""), table_cell_style),
            Paragraph(str(item.quantity or 0), table_cell_style),
            Paragraph(f"₹{item.price:.2f}", table_cell_style),
            Paragraph(f"₹{item.total:.2f}", table_cell_style)
        ])

    # Add empty rows to fill space
    for i in range(max(0, 8 - len(invoice.items))):
        table_data.append(["", "", "", ""])

    items_table = Table(
        table_data,
        colWidths=[3.5*inch, 0.8*inch, 1.2*inch, 1.5*inch]
    )

    table_style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.3, LIGHT_GRAY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ])
    # Alternating gray backgrounds
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table_style.add("BACKGROUND", (0, i), (-1, i), LIGHT_GRAY)

    items_table.setStyle(table_style)
    elements.append(items_table)
    elements.append(Spacer(1, 20))

    # =========================
    # COMMENTS + TOTALS SECTION
    # =========================
    # Company Bank Details section (left side)
    bank_name = company.bank_name if company and hasattr(company, 'bank_name') and company.bank_name else ""
    bank_account = company.bank_account_number if company and hasattr(company, 'bank_account_number') and company.bank_account_number else ""
    bank_ifsc = company.bank_ifsc if company and hasattr(company, 'bank_ifsc') and company.bank_ifsc else ""
    bank_branch = company.bank_branch if company and hasattr(company, 'bank_branch') and company.bank_branch else ""
    upi_id = company.upi_id if company and hasattr(company, 'upi_id') and company.upi_id else ""
    
    bank_details_content = ""
    if bank_name:
        bank_details_content += f"<font color='#374151'><b>Bank:</b> {bank_name}</font><br/>"
    if bank_account:
        bank_details_content += f"<font color='#374151'><b>Account:</b> {bank_account}</font><br/>"
    if bank_ifsc:
        bank_details_content += f"<font color='#374151'><b>IFSC:</b> {bank_ifsc}</font><br/>"
    if bank_branch:
        bank_details_content += f"<font color='#374151'><b>Branch:</b> {bank_branch}</font><br/>"
    if upi_id:
        bank_details_content += f"<font color='#374151'><b>UPI:</b> {upi_id}</font><br/>"
    
    if bank_details_content:
        comments_header = Paragraph("<b>BANK DETAILS</b>", comments_header_style)
        comments_content = Paragraph(bank_details_content, normal_style)
    else:
        comments_header = Paragraph("<b>COMMENTS</b>", comments_header_style)
        comments_content = Paragraph(
            """
            <font color='#374151'>1. Payment due in 30 days</font><br/>
            <font color='#374151'>2. Please note invoice number in payment</font><br/><br/>
            <font color='#6b7280'>Banking and wire transfer info can go here</font>
            """,
            normal_style
        )

    comments_table = Table(
        [[comments_header], [comments_content]],
        colWidths=[3.5*inch]
    )
    comments_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BLUE),
        ("LEFTPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 6),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("BOX", (0, 0), (-1, -1), 1, LIGHT_GRAY),
        ("LEFTPADDING", (0, 1), (-1, 1), 8),
        ("TOPPADDING", (0, 1), (-1, 1), 8),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
    ]))

    # Totals section (right side)
    subtotal = sum(item.total for item in invoice.items)
    tax_amount = subtotal * (invoice.tax / 100) if invoice.tax else 0

    totals_data = [
        [Paragraph("Subtotal", total_label_style), Paragraph(f"₹{subtotal:.2f}", total_value_style)],
        [Paragraph("Discounts", total_label_style), Paragraph("₹0.00", total_value_style)],
        [Paragraph(f"Taxes", total_label_style), Paragraph(f"₹{tax_amount:.2f}", total_value_style)],
        [Paragraph("Total", ParagraphStyle(name="TotalBold", fontSize=10, fontName="Helvetica-Bold", textColor=DARK_GRAY, alignment=TA_RIGHT)),
         Paragraph(f"₹{invoice.total:.2f}", ParagraphStyle(name="TotalBoldValue", fontSize=10, fontName="Helvetica-Bold", textColor=DARK_GRAY, alignment=TA_RIGHT))],
    ]

    totals_table = Table(
        totals_data,
        colWidths=[2*inch, 1.2*inch]
    )
    totals_table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEABOVE", (0, -1), (-1, -1), 1, DARK_GRAY),
    ]))

    # Combine comments and totals
    bottom_table = Table(
        [[comments_table, totals_table]],
        colWidths=[3.5*inch, 3*inch]
    )
    bottom_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    elements.append(bottom_table)
    elements.append(Spacer(1, 30))

    # =========================
    # SIGNATURE SECTION + THANK YOU FOOTER
    # =========================
    
    # Add client signature if exists
    if client and client.signature_path:
        sig_full_path = get_full_path(client.signature_path)
        if sig_full_path and os.path.exists(sig_full_path):
            try:
                sig_image = Image(sig_full_path, width=2*inch, height=0.8*inch)
                elements.append(sig_image)
                elements.append(Spacer(1, 5))
            except Exception as e:
                print(f"Error loading client signature: {e}")
    
    # Authorized signature line
    elements.append(Paragraph("__________________________", normal_style))
    elements.append(Paragraph("<font color='#6b7280'>Authorized Signature</font>", normal_style))
    elements.append(Spacer(1, 30))

    # Thank you footer (Orange)
    thank_you = Paragraph("Thank you for<br/>your business!", thank_you_style)
    elements.append(thank_you)

    # BUILD PDF
    doc.build(elements)

    return file_path