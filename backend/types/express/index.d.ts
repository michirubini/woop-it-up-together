import { User } from '../../types'; // Assicurati che `types.ts` contenga l'interfaccia `User`

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {}; // Serve per rendere il file un modulo
