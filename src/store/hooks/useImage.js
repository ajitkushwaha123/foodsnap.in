import { useDispatch, useSelector } from "react-redux";
import { downloadImage } from "../slice/imageSlice";

export const useImage = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.image);

  const handleDownloadImage = async (imageId) => {
    await dispatch(downloadImage({ imageId })).unwrap();
  };

  return {
    loading,
    error,
    success,
    handleDownloadImage,
  };
};
