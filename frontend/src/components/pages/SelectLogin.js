import React, { useEffect, useState } from "react";
import MentorImage from "resources/mentor-login-logo.png";
import MenteeLogin from "resources/mentee-login-logo.png";
import AdminImage from "resources/admin-login-logo.png";
import PartnerImage from "resources/partner.png";
import "components/css/SelectLogin.scss";

function SelectLogin({ displaySelect, handleSelect, handleDisplayImages }) {
	return (
		<div className="select-login-page">
			<div
				className="select-login-header"
				style={{ visibility: displaySelect ? "visible" : "hidden" }}
			>
				Please click on your role to continue on.
			</div>
			<div
				className="select-login-container"
				style={{ visibility: displaySelect ? "visible" : "hidden" }}
			>
				<div
					className="select-login-elem"
					onClick={() => {
						handleSelect("mentee");
					}}
				>
					<img src={MenteeLogin} alt="Mentee Image" className="select-image" />
					<div className="select-text">Mentee</div>
				</div>
				<div
					className="select-login-elem"
					onClick={() => {
						handleSelect("mentor");
					}}
				>
					<img src={MentorImage} alt="Mentor Image" className="select-image" />
					<div className="select-text">Mentor</div>
				</div>
				<div
					className="select-login-elem"
					onClick={() => {
						handleSelect("partner");
					}}
				>
					<img
						src={PartnerImage}
						alt="Partner Image"
						className="select-image"
						onLoad={handleDisplayImages}
					/>
					<div className="select-text">Partner</div>
				</div>
				{/*<div
					className="select-login-elem"
					onClick={() => {
						handleSelect("admin");
					}}
				>
					<img
						src={AdminImage}
						alt="Admin Image"
						className="select-image"
						
					/>
					<div className="select-text">Admin</div>
				</div>*/}
			</div>
		</div>
	);
}

export default SelectLogin;
