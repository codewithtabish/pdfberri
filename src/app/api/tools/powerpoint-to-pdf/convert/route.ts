import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";

const execAsync = promisify(exec);

export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  let inputPath = "";
  let outputPath = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uniqueId = crypto.randomUUID();
    const tempDir = tmpdir();
    
    const ext = file.name.split('.').pop() || 'pptx';
    inputPath = join(tempDir, `${uniqueId}-input.${ext}`);
    outputPath = join(tempDir, `${uniqueId}-input.pdf`);

    await writeFile(inputPath, buffer);

    // Determine the correct executable path based on OS
    let sofficePath = "soffice"; 
    
    if (process.platform === "win32") {
      const possiblePaths = [
        "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
        "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe"
      ];
      
      const foundPath = possiblePaths.find(p => existsSync(p));
      if (foundPath) {
        sofficePath = `"${foundPath}"`;
      } else {
        throw new Error("LibreOffice not found. Please install it or update the path in route.ts.");
      }
    }

    // Note: LibreOffice needs a unique user profile for concurrent conversions
    // We force it to use a temp folder for the profile to avoid locking issues
    const profileDir = join(tempDir, `lo-profile-${uniqueId}`);
    
    const command = `${sofficePath} -env:UserInstallation=file:///${profileDir.replace(/\\/g, '/')} --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`;
    
    // Increase maxBuffer for large conversions
    await execAsync(command, { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
    
    const pdfBuffer = await readFile(outputPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.(pptx|ppt)$/i, ".pdf")}"`,
      },
    });
  } catch (error) {
    console.error("PPTX to PDF conversion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Conversion failed. Ensure LibreOffice is installed." },
      { status: 500 }
    );
  } finally {
    // Always clean up temporary files, even if conversion fails
    if (inputPath) await unlink(inputPath).catch(() => {});
    if (outputPath) await unlink(outputPath).catch(() => {});
  }
}