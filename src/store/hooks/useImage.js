import { useDispatch, useSelector } from "react-redux";
import { downloadImage, reportImage } from "../slice/imageSlice";

export const useImage = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.image);

  const handleDownloadImage = async (imageId) => {
    await dispatch(downloadImage({ imageId })).unwrap();
  };

  const handleReportImage = async (imageId) => {
    console.log("imageId in handleReportImage:", imageId);
    await dispatch(reportImage({ imageId })).unwrap();
  };

  return {
    loading,
    error,
    success,
    handleDownloadImage,
    handleReportImage,
  };
};
