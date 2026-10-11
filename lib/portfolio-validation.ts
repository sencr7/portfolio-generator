const limits: Record<string, number> = {
  fullName: 100,
  title: 120,
  picture: 1000,
  email: 254,
  phone: 40,
  address: 200,
  about: 2000,
  education: 2000,
  skills: 1200,
  projects: 3000,
  experience: 3000,
  links: 2000,
};

const allowedTemplates = new Set(["simple", "modern", "creative"]);

export function readPortfolio(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Portfolio information must be a JSON object.");
  }

  const input = body as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const [key, maxLength] of Object.entries(limits)) {
    const value = input[key] ?? "";
    if (typeof value !== "string") throw new Error(`${key} must be text.`);
    if (value.length > maxLength) throw new Error(`${key} must be ${maxLength} characters or fewer.`);
    data[key] = value.trim();
  }
  if (!data.fullName) throw new Error("Full name is required.");
  const template = input.template ?? "simple";
  if (typeof template !== "string" || !allowedTemplates.has(template)) {
    throw new Error("Choose one of the three available portfolio templates.");
  }
  data.template = template;
  return data;
}
