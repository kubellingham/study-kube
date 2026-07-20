"use client";

// Resolve a courseId to a CourseBundle: built-in (email-gated) first, then
// the user's own Firestore courses (owner-only rules enforce privacy).
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useUser } from "@/lib/use-user";
import {
  buildCourseBundle,
  getBuiltinBundle,
  getBuiltinSyllabus,
  type CourseBundle,
} from "@/lib/course";
import type {
  Section,
  ExamQuestion,
  SyllabusInfo,
  IngestedFile,
} from "@/lib/course/types";

export interface FirestoreCourseDoc {
  userId: string;
  code: string;
  title: string;
  sections: Section[];
  examBank: ExamQuestion[];
  syllabus?: SyllabusInfo | null;
  files?: IngestedFile[];
  createdAt: number;
}

export function bundleFromDoc(id: string, data: FirestoreCourseDoc): CourseBundle {
  const course = {
    id,
    code: data.code,
    title: data.title,
    sections: data.sections ?? [],
  };
  try {
    return buildCourseBundle(course, data.examBank ?? []);
  } catch {
    // Defensive: stored data should be pre-sanitized, but never let a bad dep
    // brick the page — rebuild with dependencies stripped.
    return buildCourseBundle(
      {
        ...course,
        sections: course.sections.map((s) => ({
          ...s,
          topics: s.topics.map((t) => ({ ...t, deps: [] })),
        })),
      },
      data.examBank ?? []
    );
  }
}

export type CourseStatus = "loading" | "ready" | "notfound";

export function useCourse(courseId: string) {
  const { user, loading: userLoading } = useUser();
  const [status, setStatus] = useState<CourseStatus>("loading");
  const [bundle, setBundle] = useState<CourseBundle | null>(null);
  const [owned, setOwned] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusInfo | null>(null);
  const [files, setFiles] = useState<IngestedFile[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (userLoading || !user) return;
    const builtin = getBuiltinBundle(courseId, user.email);
    if (builtin) {
      setBundle(builtin);
      setSyllabus(getBuiltinSyllabus(courseId));
      setOwned(false);
      setStatus("ready");
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db(), "courses", courseId));
        if (snap.exists() && snap.get("userId") === user.uid) {
          const data = snap.data() as FirestoreCourseDoc;
          setBundle(bundleFromDoc(snap.id, data));
          setSyllabus(data.syllabus ?? null);
          setFiles(data.files ?? []);
          setOwned(true);
          setStatus("ready");
        } else {
          setStatus("notfound");
        }
      } catch {
        // Non-owner reads are rejected by the rules — same as not found.
        setStatus("notfound");
      }
    })();
  }, [courseId, user, userLoading, reloadKey]);

  return {
    user,
    userLoading,
    status,
    bundle,
    owned,
    syllabus,
    files,
    reload: () => setReloadKey((k) => k + 1),
  };
}
