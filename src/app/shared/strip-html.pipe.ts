import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'stripHtml',
  standalone: true
})
export class StripHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove HTML tags
    const tmp = document.createElement('DIV');
    tmp.innerHTML = value;
    const textContent = tmp.textContent || tmp.innerText || '';
    
    // Additional security: remove any remaining script-like patterns
    return textContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
}

