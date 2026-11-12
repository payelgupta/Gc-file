import React from "react";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/edgeFunctions";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; videoUrl?: string };

export const generateImage = async (
  prompt: string,
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress?: React.Dispatch<React.SetStateAction<string>>
) => {
  const userMsg: Msg = { role: "user", content: `🎨 ছবি তৈরি: ${prompt}` };
  setMessages((prev) => [...prev, userMsg]);
  setIsLoading(true);
  setProgress?.("ছবি তৈরি হচ্ছে...");

  try {
    const url = getEdgeFunctionUrl("generate-image");
    const headers = await getEdgeFunctionHeaders();

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.status === 429) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error || "অতিরিক্ত অনুরোধ! অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
      ]);
      return;
    }

    if (data.success && data.imageUrl) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `এই তোমার জেনারেট করা ছবি: "${prompt}" 🎨`, imageUrl: data.imageUrl },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || data.error || "দুঃখিত, ছবি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।" },
      ]);
    }
  } catch (e: any) {
    console.error("Image generation error:", e);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "ছবি তৈরি করতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করো।" },
    ]);
  } finally {
    setIsLoading(false);
    setProgress?.("");
  }
};

export const generateVideo = async (
  prompt: string,
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress?: React.Dispatch<React.SetStateAction<string>>
) => {
  const userMsg: Msg = { role: "user", content: `🎬 ভিডিও তৈরি: ${prompt}` };
  setMessages((prev) => [...prev, userMsg]);
  setIsLoading(true);

  const sources = ["HuggingFace মডেল চেষ্টা হচ্ছে...", "Pollinations চেষ্টা হচ্ছে..."];

  try {
    for (const src of sources) {
      setProgress?.(src);
      await new Promise((r) => setTimeout(r, 400));
    }

    const url = getEdgeFunctionUrl("generate-video");
    const headers = await getEdgeFunctionHeaders();

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await resp.json().catch(() => ({}));

    if (resp.status === 429) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error || "ভিডিও তৈরির সীমা অতিক্রম করেছে। কিছুক্ষণ পর চেষ্টা করুন।",
        },
      ]);
      return;
    }

    if (data.success && data.videoUrl) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `তোমার ভিডিও তৈরি হয়েছে: "${prompt}" 🎬 (${data.source})`,
          videoUrl: data.videoUrl,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${data.message || data.error || "ভিডিও তৈরি করা সম্ভব হয়নি।"}\n\n[🔗 ফ্রি ভিডিও জেনারেটর ব্যবহার করুন](${data.fallbackUrl || "https://veoaifree.com/"})`,
        },
      ]);
    }
  } catch (e: any) {
    console.error("Video generation error:", e);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `ভিডিও তৈরি করতে সমস্যা হয়েছে।\n\n[🔗 ফ্রি ভিডিও জেনারেটর ব্যবহার করুন](https://veoaifree.com/)`,
      },
    ]);
  } finally {
    setIsLoading(false);
    setProgress?.("");
  }
};
