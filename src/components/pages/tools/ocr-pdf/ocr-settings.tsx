"use client";

import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "./ocr-utils";

interface Props {
  selectedLanguages: string[];
  onLanguageChange: (langs: string[]) => void;
  onProcess: () => void;
}

export function OcrSettings({ selectedLanguages, onLanguageChange, onProcess }: Props) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) && !selectedLanguages.includes(l.code)
  );

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        onLanguageChange(selectedLanguages.filter((l) => l !== code));
      }
    } else {
      onLanguageChange([...selectedLanguages, code]);
    }
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 border border-border rounded-xl bg-card">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">OCR Languages</h3>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 w-full rounded-md border border-border px-3 py-2 text-sm bg-background cursor-text"
            onClick={() => setIsOpen(true)}
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-background p-1 shadow-lg">
              {filtered.length > 0 ? filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {lang.name}
                </button>
              )) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">No languages found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((code) => {
            const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
            return (
              <span key={code} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {lang?.name || code}
                <button 
                  onClick={() => toggleLanguage(code)}
                  className="hover:text-primary-foreground rounded-full hover:bg-primary/20 p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <button
        onClick={onProcess}
        className="w-full flex justify-center items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Make PDF Searchable
      </button>
    </div>
  );
}