import { jsPDF } from "jspdf";

export function generatePDF(data) {
    const { authors, reviewers, submissionId, submissionTitle } = data;
    const doc = new jsPDF();

    const lineHeight = 7;
    let y = 20;
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;

    const addFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
                `Page ${i} of ${pageCount} — Generated on ${new Date().toLocaleDateString()}`,
                margin,
                pageHeight - 10
            );
        }
    };

    const addText = (text, x, y, options = {}) => {
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, x, y, options);
        return y + lines.length * lineHeight;
    };

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Trust Score Report', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    y = addText(`Submission ID: ${submissionId}`, margin, y);
    y = addText(`Submission Title: ${submissionTitle}`, margin, y + 2);

    const addPersonSection = (title, people) => {
        y += 10;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text(`${title}:`, margin, y);
        y += 6;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        people.forEach((person, index) => {
            if (y > pageHeight - 40) {
                doc.addPage();
                y = margin;
            }

            y = addText(`${index + 1}. ${person.name} (${person.email})`, margin, y + 2);

            if (person.subscores) {
                Object.entries(person.subscores).forEach(([category, subscore]) => {
                    y = addText(`- ${category}: ${subscore.total}`, margin + 5, y);
                    subscore.details.forEach(detail => {
                        y = addText(`• ${detail.label}: ${detail.value}`, margin + 10, y);
                    });
                });
            }
            // if (person.subscores) {
            //     Object.entries(person.subscores).forEach(([category, subscore]) => {
            //         y = drawSubscoreBar(doc, margin + 5, y, category, subscore);
            //     });
            // }
        });
    };

    addPersonSection('Authors', authors);
    addPersonSection('Reviewers', reviewers);

    addFooter();
    doc.save('trust-score-report.pdf');
}


function drawSubscoreBar(doc, x, y, label, subscore) {
    const barWidth = 160;
    const barHeight = 8;
    const padding = 2;
    const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'];

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`${label} (${subscore.total})`, x, y);
    y += 5;

    const details = subscore.details;
    const totalScaled = details.reduce((sum, d) => sum + Math.log(d.value + 1), 0);

    let currentX = x;

    details.forEach((detail, i) => {
        const scaled = Math.log(detail.value + 1);
        const width = (scaled / totalScaled) * barWidth;

        if (width <= 0) return;

        doc.setFillColor(colors[i % colors.length]);
        doc.rect(currentX, y, width, barHeight, 'F');

        if ((width / barWidth) > 0.1) {
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text(
                `${detail.label} (${detail.value})`,
                currentX + 1.5,
                y + barHeight - 1
            );
        }

        currentX += width;
    });

    y += barHeight + padding;

    // Tooltip-like block
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    details.forEach((detail, i) => {
        const dotSize = 3;
        const dotX = x;
        const dotY = y + i * 5;

        doc.setFillColor(colors[i % colors.length]);
        doc.circle(dotX, dotY, dotSize, 'F');

        doc.text(`${detail.label}: ${detail.value}`, dotX + 6, dotY + 1.5);
    });

    return y + details.length * 5 + 5; // return updated Y
}
