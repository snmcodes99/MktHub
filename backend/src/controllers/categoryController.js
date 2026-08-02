const categoryService=require("../services/categoryService")

const createCategory=async(req,res)=>{
    const category=await categoryService.createCategory(req.body)
    res.status(201).json({
        success:true,
        message:"created succesfully new categoty",
        data:category
    })
}
const getAllCategories = async (req, res) => {
  const result = await categoryService.getAllCategories(req.query);
  res.status(200).json({
    success:true,
    message:"all categories",
    data: result.categories ? result : result,
  });
};

const updateCategory = async (req, res) => {
  const category=await categoryService.updateCategory(
    req.params.id,
    req.body
  );
  res.status(200).json({
    success:true,
    message:"Category updated successfully",
    data:category,
  });
};

const deleteCategory=async(req,res)=>{
  await categoryService.deleteCategory(req.params.id);
  res.status(200).json({
    success:true,
    message:"Category deleted successfully",
  });
};

module.exports={
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};