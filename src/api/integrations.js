// src/api/integrations.js
// De-Base44 shim: keep the same named exports so imports don’t break.
// TODO: Implement against your Render API or 3rd‑party services as needed.

const notImplemented = (name) => {
  throw new Error(`[AirCasa] Integration "${name}" is not implemented yet (Base44 removed).`);
};

export const Core = {
  InvokeLLM: async (...args) => notImplemented('Core.InvokeLLM'),
  SendEmail: async (...args) => notImplemented('Core.SendEmail'),
  UploadFile: async (...args) => notImplemented('Core.UploadFile'),
  GenerateImage: async (...args) => notImplemented('Core.GenerateImage'),
  ExtractDataFromUploadedFile: async (...args) => notImplemented('Core.ExtractDataFromUploadedFile'),
};
