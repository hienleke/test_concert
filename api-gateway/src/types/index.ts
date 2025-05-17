
export type StreamMessage = {
    id: string;
    data: {
      isvalid: boolean;
      requestId: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    };
    timestamp: string;
  };

