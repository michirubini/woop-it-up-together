// src/mocks/woops.ts

export type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
};

export type Woop = {
  id: string;
  title: string;
  owner: Participant;
  partecipanti: Participant[];
};

export const woops: Woop[] = [
  {
    id: '1',
    title: 'Imparare React',
    owner: { id: '1', firstName: 'Michi', lastName: 'Rubini', profilePicture: null },
    partecipanti: [
      { id: '1', firstName: 'Michi', lastName: 'Rubini', profilePicture: null },
      { id: '2', firstName: 'Anna', lastName: 'Bianchi', profilePicture: null },
    ],
  },
  {
    id: '2',
    title: 'Andare in palestra',
    owner: { id: '2', firstName: 'Anna', lastName: 'Bianchi', profilePicture: null },
    partecipanti: [
      { id: '2', firstName: 'Anna', lastName: 'Bianchi', profilePicture: null },
    ],
  },
  {
    id: '3',
    title: 'Leggere un libro',
    owner: { id: '3', firstName: 'Luca', lastName: 'Verdi', profilePicture: null },
    partecipanti: [
      { id: '3', firstName: 'Luca', lastName: 'Verdi', profilePicture: null },
    ],
  },
];
