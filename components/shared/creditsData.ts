export type CreditPerson = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export const creditsPeople: CreditPerson[] = [
  {
    name: "Syed Essam Uddin Khawaja",
    email: "syedessamuddin.khawa@ucalgary.ca",
    avatarUrl: "/essam.png",
  },
  {
    name: "Muhammad Ahmad",
    email: "muham.ahmad@ucalgary.ca",
    avatarUrl: "/ahmad.png",
  },
  {
    name: "Hamnah Suleman",
    email: "hamnah.suleman@ucalgary.ca",
    avatarUrl: "/hamnah.jpg",
  },
  {
    name: "Khuzaymah Bin Haris",
    email: "khuzaymah.haris@ucalgary.ca",
    avatarUrl: "/khuzaymah.jpg",
  },
];
