// Mock @xenova/transformers to avoid ESM/CJS syntax and __dirname errors in Jest
jest.mock('@xenova/transformers', () => ({
  pipeline: jest.fn().mockResolvedValue(() => ({
    data: new Float32Array(384).fill(0.1),
  })),
  env: {
    allowLocalModels: true,
    cacheDir: './.cache',
  },
}));

// Mock @google/genai
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => "Wandahoi~! (Mocked)",
        },
      }),
    }),
    models: {
       generateContent: jest.fn().mockResolvedValue({
          text: () => "Wandahoi~! (Mocked)",
       })
    }
  })),
}));
