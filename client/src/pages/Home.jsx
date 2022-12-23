import React from "react";
import { useState } from "react";
import Intro from "../components/Intro";
import Main from "../components/Main";

function Home() {
  return (
    <div>
      <div className="mt-3 d-flex justify-content-center">
        <span className="heading">Use MyToken</span>
      </div>

      <div className="d-flex">
        <Intro />
        <Main />
      </div>
    </div>
  );
}

Home.propTypes = {};

export default Home;
