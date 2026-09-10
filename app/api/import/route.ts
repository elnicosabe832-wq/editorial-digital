import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText } from "unpdf";
import { plainTextToHtml } from "@/lib/html";
import { MAX_IMPORT_BYTES, titleFromFilename } from "@/lib/manuscript";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 12 MB" },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  const title = titleFromFilename(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    if (name.endsWith(".txt")) {
      return NextResponse.json({
        title,
        html: plainTextToHtml(bytes.toString("utf8")),
      });
    }

    if (name.endsWith(".docx")) {
      const { value } = await mammoth.convertToHtml({ buffer: bytes });
      return NextResponse.json({
        title,
        html: value || "<p></p>",
      });
    }

    if (name.endsWith(".pdf")) {
      const { text } = await extractText(new Uint8Array(bytes), { mergePages: true });
      return NextResponse.json({
        title,
        html: plainTextToHtml(text || ""),
      });
    }
  } catch (error) {
    console.error("import failed", error);
    return NextResponse.json(
      { error: "No se pudo leer el archivo. Prueba otro formato o un documento más simple." },
      { status: 422 },
    );
  }

  return NextResponse.json(
    { error: "Formato no soportado. Usa .docx, .txt o .pdf" },
    { status: 415 },
  );
}
