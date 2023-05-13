import { RemarcUser } from "@/models/user.models";


export async  function getCurrentUser(): Promise<RemarcUser | null> {
  return Promise.resolve({
    id: 1,
    createdAt: new Date(),
    isDeleted: false,
    email: "marcosuarezp95@gmail.com",
    name: "Marco Suárez",
  });
}