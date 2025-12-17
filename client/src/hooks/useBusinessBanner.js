import { useEffect, useState } from "react";
import AxiosInstance from "../components/AxiosInstance";

export default function useBusinessBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedCategory =
    JSON.parse(localStorage.getItem("business_category")) || null;

  useEffect(() => {
    const fetchBanner = async () => {
      if (!selectedCategory?.id) {
        setBanner(null);
        return;
      }

      try {
        setLoading(true);
        const res = await AxiosInstance.get(
          `/business-categories/${selectedCategory.id}/`
        );
        setBanner(res.data);
      } catch (e) {
        setBanner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [selectedCategory?.id]);

  return { banner, loading };
}
