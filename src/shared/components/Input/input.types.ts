export const InputType = {
  Text: "text",
  Email: "email",
  Password: "password",
  Date: "date",
  Search: "search",
  Tel: "tel",
} as const;

export type InputType = (typeof InputType)[keyof typeof InputType];
