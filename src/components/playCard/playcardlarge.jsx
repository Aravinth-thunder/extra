import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./playCard.css";
// image
import quesImg from "../../assets/images/questions.svg";
import playImg from "../../assets/images/plays.svg";
import diyImg from "../../assets/images/diy.svg";
import playicon from "../../assets/images/playicon.svg";
import pauseIcon from "../../assets/images/pauseIcon.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  addToFavourite,
  removeFromFavourite
} from "../../redux/actions/homepageActions";
import { useHistory } from "react-router-dom";
import like from "../../assets/images/like.svg";
import notlike from "../../assets/images/notLike.svg";
import ReactPlayer from 'react-player/lazy'
import { toggleLiveGames } from '../../redux/actions/gameDetailAction';

import Roles, { OrgRoles } from "../../helpers/userTypes";
import { BASE_URL, encryptData, EXTRAMILE_SUPERADMIN_EMAIL, S3_BASE_URL } from "../../helpers/helper";
import { toggleCreateSessionAccess } from "../../redux/actions/sessionsApiActions";

const PlayCardLarge = ({
  title,
  srcImage,
  gameDetail,
  setOpenShareModal,
  setShareLink,
  setOpenLoginModal,
  scheduledBy,
  manage,
  setGameDetails,
  setOpenMobileHoverCard,
  refreshFunction,
  handleDelete,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { favGames } = useSelector((state) => state.getFavGames);
  const UserInfo = useSelector((state) => state.getUser);
  const { userInfo } = UserInfo;
  const [play, setPlay] = useState(false);
  const [liked, setLiked] = useState(false);
  const [touchMoved, setTouchMoved] = useState(false);
  const [hovered, setHovered] = useState(false);

  const addFav = () => {
    setLiked(true);
    dispatch(addToFavourite(gameDetail.id));
  };
  const removeFav = () => {
    setLiked(false)
    dispatch(removeFromFavourite(gameDetail.id));
  };
  const handleShareClick = () => {
    if (userInfo && userInfo.data && OrgRoles.includes(userInfo.data.role)) {
      const { email, organizationId } = userInfo && userInfo.data;
      const obj = { from: email, organizationId: organizationId, onBoardType: "INVITE", redirectURL: "/game-detail/" + gameDetail.id };
      const inviteToken = encryptData(obj);
      const shareLink = BASE_URL + "/join?inviteId=" + inviteToken;
      setShareLink(shareLink);
    }
    else
      setShareLink(BASE_URL + "/game-detail/" + gameDetail.id);
    setOpenShareModal(true);
  };
  useEffect(() => {
    if (favGames && favGames.data && gameDetail) {
      favGames.data.forEach((game) => {
        if (game.id === gameDetail.id) {
          setLiked(true);
          return;
        }
      });
    }
  }, [favGames])
  const handleClick = (e) => {
    if (gameDetail.isDisabled)
      return
    if (userInfo && userInfo.data && userInfo.data.role === Roles.EXTRAMILE_SUPERADMIN && gameDetail && gameDetail.id)
      history.push("/all-games/game/" + gameDetail.id);
    else if (gameDetail && gameDetail.id)
      history.push("/game-detail/" + gameDetail.id);
  };
  const handleImageClick = (e) => {
    e.preventDefault();
    if (!touchMoved) {
      setGameDetails(gameDetail);
      setOpenMobileHoverCard(true);
    }
  };

  const handleLiveToggle = async () => {
    if (gameDetail && gameDetail.id && !gameDetail.isDefault) {
      await dispatch(toggleLiveGames(gameDetail.id))
      refreshFunction();
    }
  }
  const handletoggleCreateSessionAccess = () => {
    if (gameDetail && gameDetail.id)
      dispatch(toggleCreateSessionAccess(gameDetail.id))
  }
  const togglePlay = () => {
    setPlay(prevState => !prevState);
  }
  return (
    <div className="playcard playcard-large"
      onTouchStart={() => setTouchMoved(false)}
      onTouchMove={() => setTouchMoved(true)}
      onTouchEnd={handleImageClick}
    >
      <div className="playcard-img">
        <img src={srcImage[0] && srcImage[0].includes('https://youtu.be') ? srcImage && S3_BASE_URL + srcImage[1] : srcImage && S3_BASE_URL + srcImage[0]} alt="img" />

        {scheduledBy ? (
          <>
            {/* <h5 className="scheduled-game">{title}</h5> */}
            <h3 className="created-by-field">{scheduledBy === EXTRAMILE_SUPERADMIN_EMAIL ? "Created By : Default" : "Created by : " + scheduledBy}</h3>
          </>
        ) : (
          <h5>
            {/* {title} */}
          </h5>
        )}
      </div>
      {/* show this on hover */}
      <div
        className="playcard-hover"
        onMouseEnter={() => { setHovered(true); }}
        onMouseLeave={() => { setPlay(false); setHovered(false) }}
      >
        <div className="playcard-hover-img">
          {!srcImage[0]?.includes('https://youtu.be') ? (
            <img src={srcImage && S3_BASE_URL + srcImage[0]} alt="img" />
          ) : (
            <div id="playback-video" className="playback-video">
              <ReactPlayer
                url={hovered ? srcImage && srcImage[0] : ""}
                loop={true}
                playing={play}
                onPause={() => setPlay(false)}
                onPlay={() => {
                  setPlay(true);
                  if (!hovered) {
                    setPlay(false);
                  }
                }}
                muted={false}
                config={{
                  youtube: {
                    playerVars: { disablekb: 1, origin: 'https://www.youtube.com' }
                  }
                }}
              />
            </div>
          )}
          {/* <div className="tag-label">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M6.41667 1.75L11.6667 7C11.8102 7.16042 11.8895 7.3681 11.8895 7.58333C11.8895 7.79857 11.8102 8.00625 11.6667 8.16667L8.16667 11.6667C8.00625 11.8102 7.79857 11.8895 7.58333 11.8895C7.3681 11.8895 7.16042 11.8102 7 11.6667L1.75 6.41667V4.08333C1.75 3.4645 1.99583 2.871 2.43342 2.43342C2.871 1.99583 3.4645 1.75 4.08333 1.75H6.41667Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.24998 6.41671C5.89431 6.41671 6.41665 5.89437 6.41665 5.25004C6.41665 4.60571 5.89431 4.08337 5.24998 4.08337C4.60565 4.08337 4.08331 4.60571 4.08331 5.25004C4.08331 5.89437 4.60565 6.41671 5.24998 6.41671Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {gameDetail && gameDetail.category && gameDetail.category[0] && gameDetail.category[0].title}{" "}
            Games
          </div> */}
          <div className="play-icon">
            {
              play ?
                <img src={pauseIcon} alt="pause" className="pause-button" onClick={togglePlay} />
                : <img src={playicon} alt="play" className="play-button" onClick={togglePlay} />
            }
          </div>
        </div>
        <div className="playcard-content">
          <h5 onClick={handleClick}>
            {title}
          </h5>
          <p onClick={handleClick}>
            {gameDetail && gameDetail.description}
          </p>
          <div className="playcard-review">
            {/* <div className="playcard-review-content">
              <img src={quesImg} alt="play" />
              <h4 className="questions">
                10
                <span>Questions</span>
              </h4>
            </div> */}
            {/* <div className="playcard-review-content">
                            <img src={playImg} alt="play" />
                            <h4>
                                <span>Plays</span>
                                    3k
                                </h4>
                        </div> */}
            {/* <div className="playcard-review-content">
              <img src={diyImg} alt="diy" />
              <h4>
                DIY
              </h4>
            </div> */}
          </div>
          <div className={manage ? "playcard-actions" : "playcard-actions hide"}>
            <div className="playcard-make-live">
              {
                gameDetail && gameDetail.isDefault ?
                  <>
                    <h5>Live By Default:</h5>
                    <label className="switch">
                      <input type="checkbox" checked readOnly />
                      <span className="slider disabled"></span>
                    </label>
                  </> : <>
                    <h5>Make Game Live:</h5>
                    <label className="switch">
                      <input type="checkbox" defaultChecked={gameDetail && gameDetail.isLive} />
                      <span className="slider" onClick={handleLiveToggle}></span>
                    </label>
                  </>
              }
            </div>
            <div className="playcard-make-live">
              {
                gameDetail && gameDetail.isDefault ?
                  <>
                    <h5>Allowed users to create game sessions:</h5>
                    <label className="switch">
                      <input type="checkbox" checked readOnly />
                      <span className="slider disabled"></span>
                    </label>
                  </>
                  : gameDetail && !gameDetail.isLive ?
                    <>
                      <h5>Allow users to create game sessions:</h5>
                      <div className="btn-tooltip">
                        <label className="switch disabled">
                          <input type="checkbox" checked={false} readOnly />
                          <span className="slider"></span>
                        </label>
                        <div className="tooltip" role="tooltip">
                          <span>Please make game live.</span>
                        </div>
                      </div>
                    </> : <>
                      <h5>Allow users to create game sessions:</h5>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={gameDetail && gameDetail.allowEmployeeSession} />
                        <span className="slider" onClick={handletoggleCreateSessionAccess}></span>
                      </label>
                    </>
              }
            </div>

            {/* <div className="playcard-mode-select">
                            <h5>Move Game to:</h5>
                            <div className="select-container">
                                <Select
                                    placeholder="Select"
                                    options={[
                                        { value: "New Releases", label: "New Releases" },
                                        { value: "Top 10 Picks", label: "Top 10 Picks" }
                                    ]}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: 24,
                                            border: 0,
                                            background: '#fff',
                                            // minWidth: '164px',
                                            fontSize: '13px',
                                            borderRadius: '0px',
                                            borderBottom: '1px solid #c5cdd6 !important',
                                            opacity: 1
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#23282E'
                                        }),
                                        dropdownIndicator: (base) => ({
                                            ...base,
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                        }),
                                        clearIndicator: (base) => ({
                                            ...base,
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                            opacity: 0,
                                        }),
                                        indicatorSeparator: (base) => ({
                                            ...base,
                                            opacity: 0
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            borderBottom: '0px solid #f0f0f0',
                                            background: '#fff',
                                            color: '#000',
                                            padding: 5,
                                            fontSize: '13px'
                                        })
                                    }}
                                />
                            </div>
                        </div> */}
          </div>
          <div className="playcard-bottom">
            <div className="playcard-social">
              {
                userInfo?.data &&
                  (userInfo.data.role === Roles.ORG_SUPER_ADMIN ||
                    userInfo.data.role === Roles.ORG_ADMIN) && !gameDetail.isDisabled ? (
                  <Link to={"#"}>
                    {
                      liked ? (
                        <svg width="20" height="18" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={removeFav}>
                          <path d="M8.60011 15.8C8.70011 15.9 8.90011 16 9.00011 16C9.20011 16 9.30011 15.9 9.40011 15.8L16.6001 8.4C19.6001 5.3 17.5001 0 13.2001 0C10.6001 0 9.50011 1.9 9.00011 2.3C8.50011 1.9 7.40011 0 4.80011 0C0.600113 0 -1.59989 5.3 1.40011 8.4L8.60011 15.8Z" fill="var(--color-theme)" />
                        </svg>
                      ) : (
                        <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={addFav}>
                          <path d="M17.5003 9.57205L10.0003 17.0001L2.5003 9.57205C2.00561 9.09067 1.61594 8.51207 1.35585 7.87269C1.09575 7.23331 0.970863 6.54701 0.989039 5.85699C1.00721 5.16697 1.16806 4.48819 1.46146 3.86339C1.75485 3.23859 2.17444 2.68131 2.69379 2.22663C3.21314 1.77196 3.82101 1.42974 4.47911 1.22154C5.13722 1.01333 5.83131 0.943639 6.51767 1.01686C7.20403 1.09007 7.8678 1.30461 8.46718 1.64696C9.06655 1.98931 9.58855 2.45205 10.0003 3.00605C10.4138 2.45608 10.9364 1.99738 11.5354 1.65866C12.1344 1.31994 12.7968 1.1085 13.4812 1.03757C14.1657 0.966645 14.8574 1.03775 15.5131 1.24645C16.1688 1.45514 16.7743 1.79693 17.2919 2.25042C17.8094 2.70391 18.2277 3.25934 18.5207 3.88195C18.8137 4.50456 18.975 5.18094 18.9946 5.86876C19.0142 6.55659 18.8916 7.24105 18.6344 7.8793C18.3773 8.51756 17.9912 9.09588 17.5003 9.57805" stroke="var(--color-theme)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                  </Link>
                ) : null}

              {
                (userInfo?.data && userInfo.data.role === Roles.EXTRAMILE_SUPERADMIN) || gameDetail.isDisabled ? null :
                  <Link onClick={handleShareClick} to={"#"}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect
                        width="32"
                        height="32"
                        rx="6"
                        fill="var(--color-theme)"
                        fillOpacity="0.08"
                      />
                      <path
                        d="M11.3333 17.6568C12.622 17.6568 13.6667 16.5653 13.6667 15.219C13.6667 13.8726 12.622 12.7812 11.3333 12.7812C10.0447 12.7812 9 13.8726 9 15.219C9 16.5653 10.0447 17.6568 11.3333 17.6568Z"
                        stroke="var(--color-theme)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.6667 12.7812C21.9554 12.7812 23 11.6897 23 10.3433C23 8.99698 21.9554 7.90553 20.6667 7.90553C19.378 7.90553 18.3334 8.99698 18.3334 10.3433C18.3334 11.6897 19.378 12.7812 20.6667 12.7812Z"
                        stroke="var(--color-theme)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.6667 22.5324C21.9554 22.5324 23 21.4409 23 20.0946C23 18.7482 21.9554 17.6568 20.6667 17.6568C19.378 17.6568 18.3334 18.7482 18.3334 20.0946C18.3334 21.4409 19.378 22.5324 20.6667 22.5324Z"
                        stroke="var(--color-theme)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.4333 14.1626L18.5667 11.3997"
                        stroke="var(--color-theme)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.4333 16.2753L18.5667 19.0382"
                        stroke="var(--color-theme)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
              }
            </div>
            {
              userInfo && userInfo.data && userInfo.data.role === Roles.EXTRAMILE_SUPERADMIN &&
              <button
                type="submit"
                className="btn btn-primary"
                onClick={() => handleDelete(gameDetail)}
              >
                Delete Game
              </button>
            }
            <div className={`${gameDetail.isDisabled ? "btn-tooltip deleted" : ""}`}>
              <button
                type="submit"
                className={`btn btn-primary ${gameDetail.isDisabled ? "disabled" : ""}`}
                onClick={handleClick}
              >
                {
                  userInfo && userInfo.data && userInfo.data.role === Roles.EXTRAMILE_SUPERADMIN ?
                    "Edit Game " : "View Game "
                }
              </button>
              {
                gameDetail.isDisabled &&
                <div className="tooltip" role="tooltip">
                  <span>This game is not anymore in the platform.</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
export default PlayCardLarge;
