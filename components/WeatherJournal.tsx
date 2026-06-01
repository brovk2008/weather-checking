"use client";

import { FormEvent, useState } from "react";
import { BookOpen, Save } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Note = { id: string; text: string; createdAt: string };

export function WeatherJournal() {
  const [notes, setNotes] = useLocalStorage<Note[]>("weather-checking-journal", []);
  const [text, setText] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const clean = text.trim().slice(0, 300);
    if (!clean) return;
    setNotes([{ id: crypto.randomUUID(), text: clean, createdAt: new Date().toISOString() }, ...notes].slice(0, 10));
    setText("");
  }

  return (
    <section className="glass-card rounded-[2rem] p-6" aria-label="Weather journal">
      <div className="flex items-center gap-3">
        <BookOpen aria-hidden="true" />
        <h2 className="text-2xl font-semibold">Weather Journal</h2>
      </div>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <label className="sr-only" htmlFor="weather-note">
          Save weather note
        </label>
        <input
          id="weather-note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="solid-card flex-1 rounded-2xl px-4 py-3"
          placeholder="Log how conditions affected your plans"
        />
        <button type="submit" className="accent-gradient flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-slate-950">
          <Save aria-hidden="true" />
          Save note
        </button>
      </form>
      <div className="mt-4 grid gap-3">
        {notes.map((note) => (
          <article key={note.id} className="solid-card rounded-2xl p-4">
            <p>{note.text}</p>
            <time className="text-muted text-sm">{new Date(note.createdAt).toLocaleString()}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
