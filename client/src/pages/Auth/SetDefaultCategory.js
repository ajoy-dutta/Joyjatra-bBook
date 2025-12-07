import AxiosInstance from "../../components/AxiosInstance";


export const SetCategory = async (category = null) => {
  try {
    let selectedCategory = category;

    if (!selectedCategory) {
      const res = await AxiosInstance.get("business-categories/");
      const categories = res.data;
      if (categories.length > 0) {
        selectedCategory = categories[0];
      }
    }

    if (selectedCategory) {
      localStorage.setItem("business_category", JSON.stringify(selectedCategory));
      console.log("Default category set:", selectedCategory);
    }
  } catch (err) {
    console.error("Failed to set default category:", err);
  }
};
