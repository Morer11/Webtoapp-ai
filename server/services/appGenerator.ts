import { storage } from "../storage";
import { analyzeWebsite, generateAppCode } from "./openai";

export async function generateApp(appId: number): Promise<void> {
  try {
    // Update status to generating
    await storage.updateApp(appId, { status: 'generating' });

    const app = await storage.getApp(appId);
    if (!app) {
      throw new Error("App not found");
    }

    // Step 1: Analyze website (if URL provided)
    let analysis = null;
    if (app.websiteUrl) {
      analysis = await analyzeWebsite(app.websiteUrl);
      await storage.updateApp(appId, { aiAnalysis: analysis });
      
      // Simulate analysis time
      await sleep(2000);
    }

    // Step 2: Generate app code
    const codeGeneration = await generateAppCode(
      app.websiteUrl || "uploaded-project",
      app.name,
      app.platform
    );

    // Simulate code generation time
    await sleep(3000);

    // Step 3: Simulate compilation
    await sleep(4000);

    // Step 4: Create download package
    const fileSize = Math.floor(Math.random() * (8000000 - 2000000) + 2000000); // 2-8MB
    const downloadUrl = `/api/apps/${appId}/download`;

    await storage.updateApp(appId, {
      status: 'completed',
      downloadUrl,
      fileSize,
      completedAt: new Date(),
    });

  } catch (error) {
    console.error("Error generating app:", error);
    await storage.updateApp(appId, { status: 'failed' });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
