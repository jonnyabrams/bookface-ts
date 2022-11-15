import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { makeRequest } from "../../axios";
import { PostType } from "../../typings";
import "./post.scss";
import Comments from "../comments/Comments";
import { AuthContext } from "../../context/authContext";

interface IProps {
  post: PostType;
}

const Post = ({ post }: IProps) => {
  const { currentUser } = useContext(AuthContext);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { isLoading, error, data } = useQuery(["likes", post.id], () =>
    makeRequest.get("/likes?postId=" + post.id).then((res) => {
      return res.data;
    })
  );

  console.log(data)

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (liked) => {
      // @ts-ignore
      if (liked) return makeRequest.delete("/likes?postId=" + post.id);
      // if not liked...
      // @ts-ignore
      return makeRequest.post("/likes", { postId: post.id });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );

  const handleLike = () => {
    mutation.mutate(data?.includes(currentUser.id));
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="user-info">
            <img
              src={
                post.profile_pic ? post.profile_pic : "/default-profile.jpeg"
              }
              alt=""
            />
            <div className="details">
              <Link
                to={`/profile/${post.user_id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{`${post.first_name} ${post.last_name}`}</span>
              </Link>
              <span className="date">
                <TimeAgo date={post.created_at} />
              </span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>

        <div className="content">
          <p>{post.content}</p>
          <img src={post.img && "./upload/" + post.img} alt="" />
        </div>

        <div className="info">
          <div className="item">
            {isLoading ? (
              "Loading..."
            ) : data?.includes(currentUser.id) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {data?.length === 1
              ? "1 Like"
              : data?.length + " Likes"}
          </div>
          <div className="item" onClick={() => setCommentsOpen(!commentsOpen)}>
            <TextsmsOutlinedIcon />
            10 Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
          </div>
        </div>
        {commentsOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
