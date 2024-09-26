// socket.d.ts or a similar file
import 'socket.io';

declare module 'socket.io' {
  interface Socket {
    user?: { id: number /* any other properties */ };
  }
}
