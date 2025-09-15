import { stepCountIs, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { SYSTEM_PROMPT } from "./prompts";
import { getFileChangesInDirectoryTool } from "./tools";
import fs from "fs";

// Commit message generation tool
const generateCommitMessageTool = {
  description: "Generate a concise git commit message from code changes",
  parameters: {
    type: "object",
    properties: {
      diff: { type: "string", description: "Git diff or code changes" },
    },
    required: ["diff"],
  },
  execute: async ({ diff }: { diff: string }) => {
    return `Suggested commit message: ${diff
      .slice(0, 50)
      .replace(/\n/g, " ")}...`;
  },
};

// Markdown writer tool
const writeReviewToMarkdownTool = {
  description: "Write the code review to a markdown file",
  parameters: {
    type: "object",
    properties: {
      review: { type: "string", description: "Review text content" },
      path: {
        type: "string",
        description: "File path for the markdown file",
        default: "review.md",
      },
    },
    required: ["review"],
  },
  execute: async ({ review, path }: { review: string; path: string }) => {
    fs.writeFileSync(path, `# Code Review\n\n${review}`, "utf-8");
    return `✅ Review written to ${path}`;
  },
};

const codeReviewAgent = async (prompt: string) => {
  const result = streamText({
    model: google("models/gemini-2.5-flash"),
    prompt,
    system: SYSTEM_PROMPT,
    tools: {
      getFileChangesInDirectoryTool,
      generateCommitMessageTool,
      writeReviewToMarkdownTool,
    },
    stopWhen: stepCountIs(10),
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
};

// Example run
await codeReviewAgent(
  "Review the code changes in '../my-agent' directory. For each file, make review suggestions, generate a commit message, and write the review to review.md",
);
