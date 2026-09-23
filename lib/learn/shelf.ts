"use client";

// THE SHELF — material Kube is holding but hasn't built yet.
//
// Before this, an upload had exactly one future: Kube read it, you answered one
// question, and it built immediately. Close the tab at that moment and the file
// was gone with the read. So a student who gets unit 1 on Monday and unit 2 on
// Friday had no way to say "hold this, more is coming" — and no way to see what
// Kube was already holding.
//
// A shelved item is the extracted material (text + the images Kube looks at)
// parked in Storage, plus a small Firestore record describing it. It survives
// closing the app and switching device, it never expires, and building it later
// uses the very same upload path a fresh file does — nothing is re-read and
// nothing is re-extracted.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadString } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import type { ExtractedMaterial } from "@/lib/ingest/client-extract";
import type { Observation } from "@/lib/course/generate";

/** The Firestore record for one held file. The material itself is in Storage —
 *  a doc is capped at 1MB and a picture-heavy deck is many times that. */
export interface ShelfItem {
  id: string;
  userId: string;
  courseId: string;
  /** The file's own name, as the student sees it. */
  name: string;
  addedAt: number;
  /** How much material is in it — what the shelf shows instead of a file size,
   *  because characters and pictures are what Kube actually builds from. */
  chars: number;
  imageCount: number;
  /** Everything dropped in one go shares a batch id, so the shelf can show
   *  Kube's read of that batch once instead of per file. */
  batchId: string;
  /** Kube's read of the batch this arrived in. Read ONCE, on arrival, and kept
   *  — holding material must never mean paying to re-read it. */
  read?: Observation | null;
  /** Where the material lives in Storage. */
  path: string;
}

const COLLECTION = "shelfItems";

const contentPath = (uid: string, courseId: string, itemId: string) =>
  `shelf/${uid}/${courseId}/${itemId}.json`;

/** Park a whole upload on the shelf. The material is written to Storage FIRST,
 *  so a record never exists pointing at material that isn't there. */
export async function shelveBatch(
  uid: string,
  courseId: string,
  items: { name: string; extracted: ExtractedMaterial }[],
  read: Observation | null
): Promise<ShelfItem[]> {
  if (!uid || !courseId) throw new Error("Not signed in yet — try again in a moment.");
  const batchId = `b${Date.now().toString(36)}`;
  const saved: ShelfItem[] = [];
  for (const it of items) {
    const itemRef = doc(collection(db(), COLLECTION));
    const path = contentPath(uid, courseId, itemRef.id);
    await uploadString(
      ref(storage(), path),
      JSON.stringify({ text: it.extracted.text, images: it.extracted.images }),
      "raw",
      { contentType: "application/json" }
    );
    // The id lives in the doc path, so it isn't stored in the doc itself.
    const fields: Omit<ShelfItem, "id"> = {
      userId: uid,
      courseId,
      name: it.name,
      addedAt: Date.now(),
      chars: it.extracted.text.length,
      imageCount: it.extracted.images.length,
      batchId,
      read: read ?? null,
      path,
    };
    await setDoc(itemRef, fields);
    saved.push({ id: itemRef.id, ...fields });
  }
  return saved;
}

/** Everything Kube is holding for this subject, oldest first. Two equality
 *  filters need no composite index; the ordering is done here. */
export async function listShelf(uid: string, courseId: string): Promise<ShelfItem[]> {
  const snap = await getDocs(
    query(
      collection(db(), COLLECTION),
      where("userId", "==", uid),
      where("courseId", "==", courseId)
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ShelfItem, "id">) }))
    .sort((a, b) => a.addedAt - b.addedAt);
}

/** Pull a held item's material back, ready to build exactly as if it had just
 *  been dropped in. */
export async function loadShelfContent(item: ShelfItem): Promise<ExtractedMaterial> {
  const url = await getDownloadURL(ref(storage(), item.path));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't load "${item.name}" from your shelf.`);
  const data = (await res.json()) as Partial<ExtractedMaterial>;
  return { text: data.text ?? "", images: data.images ?? [] };
}

/** Take an item off the shelf. The material goes first; a record with no
 *  material would show a row that can never be built. */
export async function removeShelfItem(item: ShelfItem): Promise<void> {
  await deleteObject(ref(storage(), item.path)).catch(() => {});
  await deleteDoc(doc(db(), COLLECTION, item.id));
}

/** How much material a held item holds, in words a student reads at a glance.
 *  Roughly 1,800 characters to a page of slides/notes. */
export function shelfSizeLabel(item: ShelfItem): string {
  const pages = Math.max(1, Math.round(item.chars / 1800));
  const text = item.chars > 0 ? `~${pages} page${pages === 1 ? "" : "s"}` : "";
  const pics = item.imageCount > 0 ? `${item.imageCount} picture${item.imageCount === 1 ? "" : "s"}` : "";
  return [text, pics].filter(Boolean).join(" · ") || "material";
}
