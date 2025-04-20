import { NoteBlock, NoteContent } from "@shared/schema";
import { jsPDF } from "jspdf";
import { Note, ExportOptions } from "../types";

// Convert note blocks to Markdown
export function convertToMarkdown(note: Note, options: ExportOptions): string {
  const { includeTitle, includeMetadata } = options;
  let markdown = "";
  
  // Add title if requested
  if (includeTitle && note.title) {
    markdown += `# ${note.title}\n\n`;
  }
  
  // Add metadata if requested
  if (includeMetadata && note.content.videoMetadata) {
    const { fileName, duration, dateProcessed } = note.content.videoMetadata;
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    
    markdown += `> Generated from: ${fileName}\n`;
    markdown += `> Duration: ${durationMinutes}m ${durationSeconds}s\n`;
    markdown += `> Processed: ${new Date(dateProcessed).toLocaleDateString()}\n\n`;
  }
  
  // Process each block
  note.content.blocks.forEach(block => {
    switch (block.type) {
      case 'title':
        markdown += `# ${block.content}\n\n`;
        break;
      case 'heading':
        markdown += `## ${block.content}\n\n`;
        break;
      case 'subheading':
        markdown += `### ${block.content}\n\n`;
        break;
      case 'paragraph':
        markdown += `${block.content}\n\n`;
        break;
      case 'bullet-list':
        markdown += `* ${block.content}\n`;
        break;
      case 'numbered-list':
        markdown += `1. ${block.content}\n`;
        break;
      case 'quote':
        markdown += `> ${block.content}\n\n`;
        break;
      case 'code':
        markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`;
        break;
      case 'todo':
        markdown += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
        break;
      case 'callout':
        markdown += `> 💡 **Note:** ${block.content}\n\n`;
        break;
      case 'divider':
        markdown += `---\n\n`;
        break;
      case 'empty':
        markdown += '\n';
        break;
    }
  });
  
  return markdown;
}

// Export note as markdown file
export function exportMarkdown(note: Note, options: ExportOptions): void {
  const markdown = convertToMarkdown(note, options);
  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Export note as PDF
export function exportPDF(note: Note, options: ExportOptions): void {
  const { includeTitle, includeMetadata } = options;
  const doc = new jsPDF();
  
  let yPosition = 20;
  const margin = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper function to add text with line wrapping
  const addText = (text: string, size: number, isBold: boolean = false) => {
    doc.setFontSize(size);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    doc.text(textLines, margin, yPosition);
    yPosition += lineHeight * textLines.length;
  };
  
  // Add title
  if (includeTitle && note.title) {
    addText(note.title, 18, true);
    yPosition += 5;
  }
  
  // Add metadata
  if (includeMetadata && note.content.videoMetadata) {
    const { fileName, duration, dateProcessed } = note.content.videoMetadata;
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    
    addText(`Generated from: ${fileName}`, 10);
    addText(`Duration: ${durationMinutes}m ${durationSeconds}s`, 10);
    addText(`Processed: ${new Date(dateProcessed).toLocaleDateString()}`, 10);
    yPosition += 5;
  }
  
  // Process each block
  note.content.blocks.forEach(block => {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    switch (block.type) {
      case 'title':
        addText(block.content, 16, true);
        yPosition += 3;
        break;
      case 'heading':
        addText(block.content, 14, true);
        yPosition += 2;
        break;
      case 'subheading':
        addText(block.content, 12, true);
        yPosition += 2;
        break;
      case 'paragraph':
        addText(block.content, 10);
        yPosition += 2;
        break;
      case 'bullet-list':
        addText(`• ${block.content}`, 10);
        break;
      case 'numbered-list':
        // For PDF we'll just use bullets since we don't track the numbering
        addText(`• ${block.content}`, 10);
        break;
      case 'quote':
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin - 3, yPosition - 5, 3, 10, 'F');
        addText(block.content, 10, false);
        yPosition += 2;
        break;
      case 'code':
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        // Get the height needed for this text block
        const textLines = doc.splitTextToSize(block.content, pageWidth - 2 * margin - 10);
        const blockHeight = textLines.length * lineHeight + 10;
        doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, blockHeight, 'F');
        
        doc.setFont('courier', 'normal');
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * lineHeight + 5;
        doc.setFont('helvetica', 'normal');
        break;
      case 'todo':
        // Draw checkbox
        doc.setDrawColor(100, 100, 100);
        doc.rect(margin, yPosition - 3, 5, 5, 'S');
        if (block.checked) {
          doc.setDrawColor(50, 50, 50);
          doc.line(margin, yPosition - 1, margin + 5, yPosition + 4);
          doc.line(margin + 5, yPosition - 3, margin, yPosition + 2);
        }
        addText(`  ${block.content}`, 10);
        break;
      case 'callout':
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(240, 245, 255);
        const calloutLines = doc.splitTextToSize(block.content, pageWidth - 2 * margin - 10);
        const calloutHeight = calloutLines.length * lineHeight + 10;
        doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, calloutHeight, 'F');
        
        addText(`💡 ${block.content}`, 10);
        yPosition += 3;
        break;
      case 'divider':
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        break;
      case 'empty':
        yPosition += 5;
        break;
    }
  });
  
  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
}
