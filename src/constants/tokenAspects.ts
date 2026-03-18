export type TokenAspect = {
  id: string;
  colorName: string;
  tailwindColorClass: string;
  azitUrl: string;
};

export const TOKEN_ASPECTS: TokenAspect[] = [
  {
    id: "green",
    colorName: "Green",
    tailwindColorClass: "bg-green-500",
    azitUrl: "https://notion.so/azit-green",
  },
  {
    id: "blue",
    colorName: "Blue",
    tailwindColorClass: "bg-blue-500",
    azitUrl: "https://notion.so/azit-blue",
  },
  {
    id: "red",
    colorName: "Red",
    tailwindColorClass: "bg-red-500",
    azitUrl: "https://notion.so/azit-red",
  },
];
