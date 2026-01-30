import JSZip from 'jszip';

export interface EPUBMetadata {
  title: string;
  author?: string;
  language?: string;
  description?: string;
}

export interface EPUBChapter {
  title: string;
  text: string;
  index: number;
}

interface SpineItem {
  id: string;
  href: string;
}

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

function stripHtml(html: string): string {
  // Remove script and style content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Convert block elements to line breaks
  text = text.replace(/<\/(p|div|h[1-6]|li|br)[^>]*>/gi, '\n');
  text = text.replace(/<(p|div|h[1-6]|li)[^>]*>/gi, '');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function extractChapterTitle(html: string, filename: string): string {
  // Try to find title from h1, h2, or title tag
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) return stripHtml(h1Match[1]);

  const h2Match = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
  if (h2Match) return stripHtml(h2Match[1]);

  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) return stripHtml(titleMatch[1]);

  // Use filename as fallback
  return filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
}

function parseXml(xmlString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

function getTextContent(element: Element | null): string {
  return element?.textContent?.trim() || '';
}

function resolvePath(base: string, relative: string): string {
  if (relative.startsWith('/')) return relative;

  const baseParts = base.split('/').slice(0, -1);
  const relativeParts = relative.split('/');

  for (const part of relativeParts) {
    if (part === '..') {
      baseParts.pop();
    } else if (part !== '.') {
      baseParts.push(part);
    }
  }

  return baseParts.join('/');
}

export async function parseEPUB(
  binaryContent: string,
): Promise<{metadata: EPUBMetadata; chapters: EPUBChapter[]}> {
  // Load the ZIP
  const zip = await JSZip.loadAsync(binaryContent, {base64: false});

  // Read container.xml to find the OPF file
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) {
    throw new Error('Invalid EPUB: missing container.xml');
  }

  const containerDoc = parseXml(containerXml);
  const rootfileElement = containerDoc.querySelector('rootfile');
  const opfPath = rootfileElement?.getAttribute('full-path');

  if (!opfPath) {
    throw new Error('Invalid EPUB: cannot find OPF file path');
  }

  // Read the OPF file
  const opfContent = await zip.file(opfPath)?.async('string');
  if (!opfContent) {
    throw new Error('Invalid EPUB: missing OPF file');
  }

  const opfDoc = parseXml(opfContent);
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/')) : '';

  // Extract metadata
  const metadataEl = opfDoc.querySelector('metadata');
  const metadata: EPUBMetadata = {
    title:
      getTextContent(metadataEl?.querySelector('title')) ||
      getTextContent(metadataEl?.querySelector('dc\\:title')) ||
      'Unknown Title',
    author:
      getTextContent(metadataEl?.querySelector('creator')) ||
      getTextContent(metadataEl?.querySelector('dc\\:creator')) ||
      undefined,
    language:
      getTextContent(metadataEl?.querySelector('language')) ||
      getTextContent(metadataEl?.querySelector('dc\\:language')) ||
      undefined,
    description:
      getTextContent(metadataEl?.querySelector('description')) ||
      getTextContent(metadataEl?.querySelector('dc\\:description')) ||
      undefined,
  };

  // Build manifest map
  const manifest: Map<string, ManifestItem> = new Map();
  opfDoc.querySelectorAll('manifest item').forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    const mediaType = item.getAttribute('media-type');
    if (id && href && mediaType) {
      manifest.set(id, {id, href, mediaType});
    }
  });

  // Get spine order
  const spine: SpineItem[] = [];
  opfDoc.querySelectorAll('spine itemref').forEach(itemref => {
    const idref = itemref.getAttribute('idref');
    if (idref && manifest.has(idref)) {
      const item = manifest.get(idref)!;
      spine.push({id: idref, href: item.href});
    }
  });

  // Extract chapters
  const chapters: EPUBChapter[] = [];
  let chapterIndex = 0;

  for (const spineItem of spine) {
    const filePath = opfDir ? `${opfDir}/${spineItem.href}` : spineItem.href;
    const content = await zip.file(filePath)?.async('string');

    if (!content) continue;

    const text = stripHtml(content);

    // Skip very short chapters (likely front matter)
    if (text.length < 100) continue;

    const title = extractChapterTitle(content, spineItem.href);

    chapters.push({
      title: title || `Chapter ${chapterIndex + 1}`,
      text,
      index: chapterIndex,
    });

    chapterIndex++;
  }

  if (chapters.length === 0) {
    throw new Error('No readable content found in EPUB');
  }

  return {metadata, chapters};
}
