import React, { useState, useEffect } from "react";
import { Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getDisplaySpecializations } from "utils/api";

export function SortByApptDropdown(props) {
  const options = {
    ASCENDING: {
      key: 0,
      text: "Greatest to least",
    },
    DESCENDING: {
      key: 1,
      text: "Least to greatest",
    },
  };

  const [option, setOption] = useState({});

  useEffect(() => {
    setOption(false);
  }, [props.onReset, props.onChangeData]);

  const handleClick = (newOption) => {
    setOption(newOption);
    props.onChange(newOption.key);
  };

  const overlay = (
    <Menu>
      <Menu.Item>
        <a onClick={() => handleClick(options.ASCENDING)}>Greatest to least</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.DESCENDING)}>Least to greatest</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={overlay} className={props.className} trigger={["click"]}>
      <a>
        {option ? option.text : "Sort Order"} <DownOutlined />
      </a>
    </Dropdown>
  );
}

export function MenteeMentorDropdown(props) {
  const options = {
    MENTORS: {
      key: 0,
      text: "Mentors",
    },
    MENTEES: {
      key: 1,
      text: "Mentees",
    },
    PARTNERS: {
      key: 2,
      text: "Partners",
    },
    GUESTS: {
      key: 4,
      text: "Guests",
    },
    SUPPORT: {
      key: 5,
      text: "Supporters",
    },
    MODERATOR: {
      key: 7,
      text: "Moderators",
    },
    // ALL: {
    //   key: 3,
    //   text: "All",
    // },
  };

  const [option, setOption] = useState(options.MENTORS);

  useEffect(() => {
    setOption(options.MENTORS);
  }, [props.onReset]);

  const handleClick = (newOption) => {
    setOption(newOption);
    props.onChange(newOption.key);
  };

  const overlay = (
    <Menu>
      <Menu.Item>
        <a onClick={() => handleClick(options.MENTORS)}>Mentors</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.MENTEES)}>Mentees</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.PARTNERS)}>Partners</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.GUESTS)}>Guests</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.SUPPORT)}>Supporters</a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.MODERATOR)}>Moderators</a>
      </Menu.Item>
      {/* <Menu.Item>
        <a onClick={() => handleClick(options.ALL)}>All</a>
      </Menu.Item> */}
    </Menu>
  );
  return (
    <Dropdown overlay={overlay} className={props.className} trigger={["click"]}>
      <a>
        {option.text} <DownOutlined />
      </a>
    </Dropdown>
  );
}

export function SpecializationsDropdown(props) {
  const [option, setOption] = useState("Filter by");
  const [selected, setSelected] = useState([]);
  const [specMasters, setSpecMasters] = useState([]);

  useEffect(() => {
    setOption("Filter by");
  }, [props.onReset]);

  useEffect(() => {
    async function getMasters() {
      setSpecMasters(await getDisplaySpecializations());
    }
    getMasters();
  }, []);

  const handleClick = (newOption, text) => {
    setOption(text);
    const newSelected = selected;
    newSelected.push(newSelected);
    setSelected(newSelected);
    props.onChange(newOption);
  };

  const overlay = (
    <Menu>
      {specMasters.map((element, i) => {
        return (
          <Menu.Item>
            <a
              onClick={() => handleClick(i, element.label)}
              style={{ color: selected.includes(i) ? "red" : "black" }}
            >
              {element.label}
            </a>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <Dropdown
      overlay={overlay}
      className={props.className}
      trigger={["click"]}
      overlayStyle={{ overflowY: "scroll", height: "20em" }}
    >
      <a>
        {option} <DownOutlined />
      </a>
    </Dropdown>
  );
}

export function SortByDateDropdown(props) {
  const options = {
    ASCENDING: {
      key: 0,
      text: "Date added (newest)",
    },
    DESCENDING: {
      key: 1,
      text: "Date added (oldest)",
    },
  };

  const [option, setOption] = useState({});

  useEffect(() => {
    setOption(false);
  }, [props.onReset]);

  const handleClick = (newOption) => {
    setOption(newOption);
    props.onChange(newOption.key);
  };

  const overlay = (
    <Menu>
      <Menu.Item>
        <a onClick={() => handleClick(options.ASCENDING)}>
          {options.ASCENDING.text}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a onClick={() => handleClick(options.DESCENDING)}>
          {options.DESCENDING.text}
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={overlay} className={props.className} trigger={["click"]}>
      <a>
        {option ? option.text : "Sort Order"} <DownOutlined />
      </a>
    </Dropdown>
  );
}

export function HubsDropdown(props) {
  const [option, setOption] = useState("Filter by");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setOption("Filter by");
  }, [props.onReset]);

  const handleClick = (newOption, text) => {
    setOption(text);
    const newSelected = selected;
    newSelected.push(newSelected);
    setSelected(newSelected);
    props.onChange(newOption);
  };

  const overlay = (
    <Menu>
      {props.options &&
        props.options.map((element, i) => {
          return (
            <Menu.Item>
              <a
                onClick={() => handleClick(element.value, element.label)}
                style={{ color: selected.includes(i) ? "red" : "black" }}
              >
                {element.label}
              </a>
            </Menu.Item>
          );
        })}
    </Menu>
  );

  return (
    <Dropdown
      overlay={overlay}
      className={props.className}
      trigger={["click"]}
      overlayStyle={{ overflowY: "auto", height: "auto" }}
    >
      <a>
        {option} <DownOutlined />
      </a>
    </Dropdown>
  );
}
