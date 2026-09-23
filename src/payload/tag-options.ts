export const PRODUCT_TYPE_OPTIONS = [
  { label: "App", value: "app" },
  { label: "Physical product", value: "physical-product" },
  { label: "Service", value: "service" },
] as const;

export const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
] as const;

type OptionValue<T extends readonly { value: string }[]> = T[number]["value"];

export const optionValues = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value) as [OptionValue<T>, ...OptionValue<T>[]];
