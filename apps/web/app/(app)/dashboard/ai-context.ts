"use client";
import { createContext, useContext } from "react";

export const AICopilotContext = createContext({
  openAi: () => {},
});

export const useAiCopilot = () => useContext(AICopilotContext);
