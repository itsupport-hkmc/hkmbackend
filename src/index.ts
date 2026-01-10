export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("HKM Backend is live 🚀", {
      headers: { "content-type": "text/plain" },
    });
  },
};
