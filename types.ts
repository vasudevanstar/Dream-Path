
export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export type College = {
  name: string;
  location: string;
  courses: Course[];
};

export type Course = {
  name: string;
  stream: 'Science' | 'Commerce' | 'Arts' | 'Any';
  cutoff: number; // Percentage
  fees: number; // Annual fee in INR
  ranking?: number; // Optional national ranking
};
