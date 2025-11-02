export type ActionStatus = 'idle' | 'success' | 'error';

export type ActionState = {
  status: ActionStatus;
  message: string | null;
};

export const initialActionState: ActionState = {
  status: 'idle',
  message: null,
};
