import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTags } from "../../hooks/tags/useTags";
import { withSSRAuth } from "../../utils/withSSRAuth";

export default function Senders() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('')

  const { register, handleSubmit } = useForm();

 const { data, isLoading, error, isFetching, refetch } = useTags(page, searchQuery);

  
}

export const getServerSideProps = withSSRAuth(async ctx => {
  return {
    props: {}
  };
});