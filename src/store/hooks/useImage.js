import { useDispatch, useSelector } from "react-redux";
import {
  downloadImage,
  fetchDownloadedImages,
  reportImage,
} from "../slice/imageSlice";

export const useImage = () => {
  const dispatch = useDispatch();

  const { downloadedImages, pagination, loading, error, success } = useSelector(
    (state) => state.image
  );

  const handleDownloadImage = async (imageId) => {
    await dispatch(downloadImage({ imageId })).unwrap();
  };

  const handleReportImage = async (imageId) => {
    await dispatch(reportImage({ imageId })).unwrap();
  };

  const fetchAllDownloadedImages = async (page = 1, limit = 10) => {
    await dispatch(fetchDownloadedImages({ page, limit })).unwrap();
  };

  return {
    downloadedImages,
    pagination,

    loading,
    error,
    success,

    handleDownloadImage,
    handleReportImage,
    fetchAllDownloadedImages,
  };
};
