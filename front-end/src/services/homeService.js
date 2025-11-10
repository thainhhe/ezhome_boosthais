import api from "./api";

export const homeService = {
  async getTopDistricts() {
    const res = await api.get("/api/home/top-districts");
    return res.data;
  },
};

export default homeService;


