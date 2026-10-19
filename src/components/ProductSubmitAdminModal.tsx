import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "../utils/formatters";
import {

  Save,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  X,
  Wrench,
  Package,
  Images,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SelectInput from "./SelectInput";
import API from "@/api/api";
import Spinner from "./Spinner";

export default function ProductSubmitAdminModal({ products, categories, brands, setProducts, setIsProductModalOpen, setIsQuickCategoryModalOpen, setEditingProduct, setIsQuickBrandModalOpen, editingProduct }) {
  const imagePayloads = useRef([])
  console.log(editingProduct)
  const [formConfig, setFormConfig] = useState([
    { code: "title", required: true, regex: null, value: editingProduct.title || "", label: "عنوان محصول", isNumeric: false, onInput: null, error: "" },
    { code: "technical_model", required: true, regex: null, value: editingProduct.technical_model || "", label: "مدل فنی / پارت نامبر", isNumeric: false, onInput: null, error: "" },
    { code: "price", required: true, regex: null, value: editingProduct.price || "", label: "قیمت پایه فروش (تومان)", isNumeric: true, error: "" },
    { code: "off", required: false, regex: /^(100|[1-9]?[0-9])$/, value: editingProduct.off || "", label: "تخفیف", isNumeric: true, onInput: null, error: "" },
    { code: "weight", required: true, regex: null, value: editingProduct.weight || "", label: "وزن", isNumeric: true, error: "" },
    { code: "serial_number", required: true, regex: null, value: editingProduct.serial_number || "", label: "شماره کالا", isNumeric: false, error: "" },
    { code: "inventory", required: true, regex: null, value: editingProduct.inventory || "", label: "موجودی", isNumeric: true, onInput: null, error: "" },
  ]);

  const compileImagesFromEditingProduct = () => {
    if (!editingProduct.files) {
      return []
    }
    return editingProduct.files.map(ele => ({
      pk: ele.pk,
      url: ele.image,
      name: ele.alt_name,
      isCompiledFromEditingProduct: true
    }))
  }

  const compileFeatures = () => {
    if (editingProduct?.features) {
      return editingProduct.features.map(feature => (
        { ...feature, isCompiledFromEditingProduct: true }
      ))
    }
    return []
  }

  const [description, setDescription] = useState(editingProduct.description || "")
  const [descriptionError, setDescriptionError] = useState("")
  const [isFeatureAddModalOpen, setIsFeatureAddModalOpen] = useState(false)
  const [images, setImages] = useState(compileImagesFromEditingProduct)
  const [feature, setFeature] = useState({ feature_name: "", feature_value: "" })
  const [featureError, setFeatureError] = useState("")
  const [features, setFeatures] = useState(compileFeatures)
  const [brandId, setBrandId] = useState(editingProduct.brand?.pk || null)

  const [productType, setProductType] = useState([{ code: "pomp", name: "پمپ", selected: editingProduct.product_type === "pomp" }, { code: "part", name: "قطعه", selected: editingProduct.product_type === "part" }])
  const [unSelectedCategoriesSearchQuery, setUnSelectedCategoriedSearchQuery] = useState("")
  const deferedUnSelectedCategoriesSearchQuery = useDeferredValue(unSelectedCategoriesSearchQuery)
  const [selectedCategoriesSearchQuery, setSelectedCategoriedSearchQuery] = useState("")
  const deferedSelectedCategoriesSearchQuery = useDeferredValue(selectedCategoriesSearchQuery)
  const [brandError, setBrandError] = useState("")
  const [deletingFilePK, setDeletingFilePK] = useState(null)
  const [deletingFeaturePK, setDeletingFeaturePK] = useState(null)


  const handleEditingProductFeatureDelete = async (feature) => {
    try {
      setDeletingFeaturePK(feature?.pk)
      const { data, status } = await API.delete("products/prodcut-feature-delete/" + feature?.pk?.toString() + "/")
      if (status === 200) {
        setFeatures(prev => [...prev].filter(ele => (!ele.isCompiledFromEditingProduct && ele.pk !== feature.pk)))
        startTransition(() => {
          setProducts(prev => [...prev].map(p => {
            console.log(p, editingProduct, "testing")
            if (p.pk === editingProduct.pk) {
              p.features = [...p.features].filter(f => feature.pk !== f.pk)
            }
            return p
          }));
        })
      } else {
        const e = data.error_des || data.detail || "خطا"
        console.log(e)
      }
      setDeletingFeaturePK(null)
    } catch (e) {
      console.log(e)
      setDeletingFeaturePK(null)

    }
  }


  const handleEditingProductFileDelete = async (file) => {
    try {
      setDeletingFilePK(file.pk)
      const { data, status } = await API.delete("products/product-file-delete/" + file.pk.toString() + "/")
      if (status === 200) {
        const newImages = images.filter(ele => {

          if (ele.isCompiledFromEditingProduct && ele.pk === file.pk) {
            return false
          }
          return true
        })
        setImages(newImages)
        const newProducts = products.map(p => {
          console.log(p, "prodcut", p.files, p.pk, "editing product", editingProduct.pk)
          if (p.pk === editingProduct.pk) {

            p.files = [...p.files].filter(image => {
              console.log(image.pk, file.pk, "image is moz")
              return image.pk.toString() !== file.pk.toString()
            })
          }
          return p
        }
        )

        console.log(newProducts, "new products as hell", editingProduct.pk)
        setProducts(newProducts)
        setEditingProduct(prev => ({ ...prev, files: [] }))

        console.log(editingProduct.files, "after changes")

      } else {
        const e = data.error_des || data.detail || "error"
        console.log(e)
      }
      setDeletingFilePK(null)
    } catch (e) {
      console.log(e)
      setDeletingFilePK(null)

    }
  }

  const compileCategories = useCallback(() => {
    if (editingProduct?.categories?.length) {
      const ids = editingProduct.categories?.map(ele => ele.pk)
      return categories.map(ele => ({ selected: ids.find(id => ele.pk === id), data: ele }))
    }
    return categories?.map(ele => ({ selected: false, data: ele }))
  }, [categories])

  const [categoriesData, setCategoriesData] = useState(compileCategories)

  useEffect(() => {
    setCategoriesData(compileCategories)
  }, [categories])

  const selectedCategoriesRef = useRef(null)
  const unSelectedCategoriesRef = useRef(null)


  const selectedCategories = categoriesData.filter(ele => {
    if (!ele.selected) {
      return false
    }
    if (!ele.data?.name?.includes(deferedSelectedCategoriesSearchQuery)) {
      return false;
    }
    return true
  })


  const unSelectedCategories = categoriesData.filter(ele => {
    if (ele.selected) {
      return false
    }
    if (!ele?.data.name.includes(deferedUnSelectedCategoriesSearchQuery)) {
      return false;
    }
    return true
  })



  const imageInputHandler = async (file) => {
    try {
      const fileReader = new FileReader()
      fileReader.addEventListener("load", (e) => {
        setImages(prev => [...prev, { url: e.target?.result, name: file.name }])
        imagePayloads.current = [...imagePayloads.current, file]
      })
      fileReader.readAsDataURL(file)
    } catch (e) {
      console.log(e)
    }
  }

  const handleSaveProductForm = async (e) => {
    try {
      e.preventDefault()
      let isValid = true

      if (brandError) {
        setBrandError("")
      }

      if (descriptionError) {
        setDescriptionError("")
      }

      const compiledFormConfig = formConfig.map(ele => {
        if (ele.required && !ele.value) {
          ele.error = "مقدار این فیلد اجباری است"
          isValid = false
        }
        if (ele.regex && !ele.regex.test(ele.value)) {
          ele.error = `لطفا یک مقدار معتبر برای ${ele.label} وارد کنید`
          isValid = false
        }
        return ele
      })
      setFormConfig(compiledFormConfig)
      if (!brandId) {
        isValid = false
        setBrandError("لطفا برند را وارد کنید")
      }
      const formData = new FormData(e.currentTarget)
      imagePayloads.current.forEach(file => {

        formData.append(file.name, file)
      })
      if (!description) {
        isValid = false
        setDescriptionError("مقدار این فیلد اجباری است")
      }
      const catIDS = categoriesData.filter(ele => ele.selected).map(ele => ele.data?.pk)
      formData.append("categories_id", JSON.stringify(catIDS))
      formData.append("brand_id", brandId || "")
      formData.append("features", JSON.stringify(editingProduct ? features.filter(ele => !ele.isCompiledFromEditingProduct) : features))
      formData.append("product_type", productType.find(ele => ele.selected)?.code || "pomp")

      if (isValid) {
        const { data, status } = await API.post(editingProduct?.pk ? `products/product-admin-update/${editingProduct?.pk}/` : "products/product-admin-submit/", formData)
        if (status === 200) {
          setIsProductModalOpen(false)
          if (editingProduct?.pk) {
            setProducts(prev => [...prev].map(product => {
              if (product.pk === editingProduct?.pk) {
                return data.result
              }
              return product
            }))
          } else {
            setProducts(prev => [...prev, data.result])
          }
        } else {
          const e = data.error_des || data.detail || "خطایی رخ داده است"
          console.log(
            e
          )
        }
      }
    } catch (e) {

    }
  }




  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4  ">
      <div className="bg-white scrollbar-thumb-indigo-400 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative border overflow-y-auto h-[90%] border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct.title ? 'ویرایش کالا' : 'تعریف و ثبت پمپ / قطعه یدکی جدید'}
              </h3>
              <p className="text-[11px] text-slate-400">اطلاعات فنی، دسته‌بندی، برند و قیمت روزانه کالا</p>
            </div>
          </div>
          <button
            onClick={() => setIsProductModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
          {/* Main Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {formConfig.map(conf => (
              <div>
                <label className="font-bold text-slate-700 block mb-1">{conf.label}: {conf.required && "*"}</label>
                <input
                  type="text"

                  name={conf.code}
                  value={conf.value}
                  onChange={(e) => setFormConfig(prev => [...prev].map(ele => {
                    if (ele.code !== conf.code) {
                      return ele;
                    }
                    let value = e.target.value
                    if (ele.isNumeric) {
                      value = value.replace(/\D/g, "")
                    }
                    ele.value = value
                    return ele
                  }))}
                  placeholder={conf.label}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                />
                {conf.error &&
                  <p className="test-md text-red-600">
                    {conf.error}
                  </p>
                }
              </div>
            ))}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">نوع محصول*</label>

              </div>
              <SelectInput items={productType} isLoadingItems={false} labelProperty={"name"} onItemSelected={item => setProductType(prev => [...prev].map(ele => ({ ...ele, selected: ele.code === item.code })))} selectedItem={productType.find(ele => ele.selected)} />


            </div>

            {/* Category Selector with Quick Add Button */}

            <div className="w-full">
              <button
                type="button"
                onClick={() => setIsQuickCategoryModalOpen(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200"
              >
                <Plus className="w-3 h-3" />
                <span> دسته جدید</span>
              </button>
            </div>

            <div className="w-full col-span-full flex flex-col md:flex-row justify-between items-center">
              <div className="flex w-full flex-col ">

                <div className="p-1.5 rounded-t-md bg-slate-300">
                  <span className="text-md text-gray-800">دسته بندی ها</span>

                </div>

                <div className="p-1 w-full bg-slate-100">
                  <input type="text"
                    className="w-full border rounded-md p-1  border-slate-300  text-md bg-slate-200  "
                    value={unSelectedCategoriesSearchQuery}
                    onChange={(e) => setUnSelectedCategoriedSearchQuery(e.target.value)}
                    placeholder="جستجو در دسته بندی ها" />
                </div>
                <select
                  ref={unSelectedCategoriesRef}
                  className="bg-slate-400 h-30 rounded-b-md" multiple>

                  {unSelectedCategories.map(({ data }) => (
                    <option className="p-1 checked:bg-slate-700 checked:text-white my-1 rounded-xl " value={data.pk}>{data.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex m-1   gap-3 flex-row md:flex-col">
                <div onClick={() => {
                  const selectedPks = []
                  unSelectedCategoriesRef.current?.querySelectorAll("option").forEach(ele => {
                    if (ele.selected) {
                      selectedPks.push(ele.value)
                    }
                  });
                  setCategoriesData(prev => [...prev].map(cat => {

                    if (!selectedPks.includes(cat.data?.pk?.toString())) {
                      return cat
                    }
                    cat.selected = true
                    return cat
                  }))
                }} className="w-7 -rotate-90 md:rotate-0 h-7 bg-slate-200 flex items-center justify-center rounded-full">
                  <ChevronLeft

                  />
                </div>
                <div onClick={() => {
                  const selectedPks = []
                  selectedCategories.current?.querySelectorAll("option").forEach(ele => {
                    if (ele.selected) {
                      selectedPks.push(ele.value)
                    }
                  });
                  setCategoriesData(prev => [...prev].map(cat => {

                    if (selectedPks.includes(cat.data?.pk?.toString())) {
                      return cat
                    }
                    cat.selected = false
                    return cat
                  }))
                }} className="w-7 h-7 -rotate-90 md:rotate-0 bg-slate-200 flex items-center justify-center rounded-full">
                  <ChevronRight />
                </div>

              </div>
              <div className="flex w-full flex-col ">
                <div className="p-1.5 rounded-t-md bg-slate-300">
                  <span className="text-md text-gray-800">دسته بندی های انتخابی</span>
                </div>
                <div className="p-1 w-full bg-slate-100">
                  <input type="text"
                    className="w-full border border-slate-300 rounded-md p-1 text-md bg-slate-200  "
                    value={selectedCategoriesSearchQuery}
                    onChange={(e) => setSelectedCategoriedSearchQuery(e.target.value)}
                    placeholder="جستجو در دسته بندی ها" />
                </div>
                <select
                  ref={selectedCategoriesRef}
                  className="bg-slate-400 h-30 rounded-b-md" multiple>
                  {selectedCategories.map(({ data }) => (
                    <option className="p-1 checked:bg-slate-700 checked:text-white my-1 rounded-xl " value={data.pk}>{data.name}</option>
                  ))}
                </select>

              </div>


            </div>
            {/* Brand Selector with Quick Add Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">برند سازنده: *</label>
                <button
                  type="button"
                  onClick={() => setIsQuickBrandModalOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ برند جدید</span>
                </button>
              </div>
              <SelectInput items={brands} isLoadingItems={false} labelProperty={"name"} onItemSelected={item => setBrandId(item.pk)} selectedItem={brands.find(ele => ele.pk === brandId)} />
              {brandError &&
                <p className="text-sm text-red-600 my-1">
                  {brandError}
                </p>
              }


            </div>

            {/* Image URL, File Upload & Archived Gallery Selector */}
            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-emerald-600" />
                  <span>تصویر محصول و گالری آرشیو عکس‌ها:</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>آپلود عکس جدید</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        e.preventDefault()
                        imageInputHandler(e.target.files[0])
                      }}
                      className="hidden"
                    />
                  </label>


                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div >
                    <div className="w-12 h-12 z-30 relative rounded-xl border border-slate-300 overflow-hidden bg-white shrink-0  group shadow-xs">
                      <button disabled={deletingFilePK && deletingFilePK === image.pk} onClick={() => {
                        if (image.isCompiledFromEditingProduct && image.pk) {
                          handleEditingProductFileDelete(image);
                          return;
                        }
                        setImages(prev => [...prev].filter((_, idx) => idx !== index))
                      }} className="absolute z-100 p-0.5 rounded-full bg-slate-100 top-0 right-0">
                        {deletingFilePK && deletingFilePK === image.pk ? <Spinner height={12.5} width={12.5} borderMainColor={"white"} borderTopColor={"red"} borderWidth={1.25} /> :
                          <X size={15} className="hover:text-red-500  transition-colors" />

                        }
                      </button>
                      <img
                        src={image.url}

                        alt="پیش‌نمایش"
                        className="w-full z-10 h-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                    <input
                      name={"image-alt-" + image.name}
                      defaultValue={image.name}
                      className="w-[75%] my-1 rounded-md bg-slate-200 p-1 text-sm z-150"
                      type="text" />
                  </div>
                ))}

              </div>
            </div>
          </div>



          {/* Detailed Technical Specs Panel */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Wrench className="w-4 h-4 text-sky-600" />
              <span className="font-extrabold text-slate-900">مشخصات فنی تخصصی پمپ و قطعات:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {features.map((feature, idx) => (
                <div>
                  <div className="flex mb-1 items-center justify-between ">
                    <label className="text-[11px] font-bold text-slate-600 block mb-0.5">{feature.feature_name}:</label>
                    <div onClick={() => {
                      if (feature.isCompiledFromEditingProduct) {
                        handleEditingProductFeatureDelete(feature)
                        return
                      }
                      setFeatures(prev => [...prev].filter((_, filtered_idx) => filtered_idx !== idx))
                    }} className="flex transition-colors hover:bg-red-500 hover:border-white hover:text-white  bg-transparent p-0.5 rounded-md border-2 text-red-500 border-red-500 cursor-pointer items-center justify-around">
                      {deletingFeaturePK && deletingFeaturePK === feature.pk ? <Spinner width={15} height={15} borderWidth={1.5} borderMainColor={"gray"} borderTopColor={"red"} /> : <>
                        <X size={10} />
                        <span>حذف</span></>}
                    </div>
                  </div>
                  <div

                    className="w-full bg-white p-2 rounded-xl border border-slate-300 focus:border-sky-600 outline-none"
                  >
                    {feature.feature_value}
                  </div>
                </div>
              ))}
              <div onClick={() => setIsFeatureAddModalOpen(true)} className="group h-15 w-15 bg-slate-100 border-[1.5px] rounded-xl border-slate-300 flex justify-center items-center">
                <Plus className="group-hover:transform-[rotate(90deg)]  transition-transform" />
              </div>

            </div>
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">توضیحات و مشخصات کاربردی کالا:</label>
            <textarea
              rows={2}
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات کوتاه در مورد کاربرد پمپ یا نحوه تعویض قطعه یدکی..."
              className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 focus:bg-white focus:border-sky-600 outline-none"
            />
            {descriptionError &&
              <p className="text-sm text-red-500">
                {descriptionError}
              </p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-sky-600 text-white font-extrabold hover:bg-sky-700 shadow flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره کالا در فروشگاه</span>
            </button>
          </div>
        </form>
      </div>
      {isFeatureAddModalOpen && (
        <div className="fixed inset-0 w-dvw h-dvh flex items-center justify-center bg-slate-900/70 z-150 ">
          <div className="p-1.75 rounded-xl bg-white w-[90%] md:w-100">
            <div className="flex items-center justify-between">

              <div className="text-xl font-medium">
                وارد کردن ویژگی جدید
              </div>
              <div onClick={() => setIsFeatureAddModalOpen(false)} className="transition-colors hover:text-red-500">
                <X className="" />
              </div>

            </div>
            <div className="grid my-3 grid-cols-2 md:grid-cols-1 ">
              <div>
                <div className="text-md text-gray-600"> نام:</div>
                <input
                  onChange={(e) => setFeature(prev => ({ ...prev, feature_name: e.target.value }))}
                  className="bg-gray-100 p-1 w-[95%] rounded-xl focus:border focus:border-gray-300 outline-none"

                />
              </div>
              <div>
                <div className="text-md text-gray-600"> ویژگی:</div>
                <input
                  onChange={(e) => setFeature(prev => ({ ...prev, feature_value: e.target.value }))}
                  className="bg-gray-100 p-1 w-[95%] rounded-xl focus:border focus:border-gray-300 outline-none"

                />
              </div>
            </div>
            <div className="w-full">
              {featureError && (
                <span className="text-red-500">{featureError}</span>

              )}
            </div>
            <div className="flex items-center justify-end">
              <div onClick={() => {
                if (!feature.feature_value || !feature.feature_name) {
                  setFeatureError("لطفا مقادیر را پر کنید")
                  return;
                }
                setFeatures(prev => [...prev, feature])
                setFeature({ feature_name: "", feature_value: "" })
                setIsFeatureAddModalOpen(false)
              }} className="bg-blue-700 flex items-center justify-between p-1.5 rounded-xl hover:bg-green-700 font-semibold text-white transition-colors  cursor-pointer">
                <Plus />
                <span className="text-sm">
                  وارد کردن
                </span>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}