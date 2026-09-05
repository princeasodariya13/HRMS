import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { Readable } from "stream";

export async function uploadToGoogleDrive(companyId: string, file: File, title: string) {
  // 1. Find the company admin
  const admin = await prisma.user.findFirst({
    where: { 
      companyId: companyId,
      role: { in: ['SUPER_ADMIN', 'COMPANY_ADMIN'] } 
    },
    include: { accounts: true }
  });

  if (!admin) {
    throw new Error("No company admin found");
  }

  // 2. Find the Google Account for this admin
  const googleAccount = admin.accounts.find(a => a.provider === 'google');
  if (!googleAccount || !googleAccount.refresh_token) {
    throw new Error("Company admin has not connected their Google account with Drive permissions.");
  }

  // 3. Initialize OAuth2 Client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  oauth2Client.setCredentials({
    refresh_token: googleAccount.refresh_token,
    access_token: googleAccount.access_token,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 4. Convert File to Stream
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  // 5. Upload to Drive
  try {
    const response = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    return response.data;
  } catch (error: any) {
    console.error("Google Drive Upload Error:", error);
    
    // If token expired, NextAuth doesn't auto-refresh the DB token if they haven't logged in recently.
    // googleapis handles automatic token refresh if refresh_token is provided.
    // If it still fails, we throw.
    throw new Error(error.message || "Failed to upload to Google Drive");
  }
}
