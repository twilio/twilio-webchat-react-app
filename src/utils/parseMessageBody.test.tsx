import { ReactElement } from "react";

import { parseMessageBody } from "./parseMessageBody";

describe("parseMessageBody", () => {
    it("parses body without links correctly", () => {
        const messageBody = "hello everyone this is some text";

        expect(parseMessageBody(messageBody, false)).toStrictEqual([messageBody]);
    });

    it("parses multiline body without links correctly", () => {
        const line1 = "hello everyone,";
        const line2 = "this is a multiline";
        const line3 = "message.";
        const messageBody = `${line1}\n${line2}\n${line3}`;

        expect(parseMessageBody(messageBody, false)).toStrictEqual([line1, "\n", line2, "\n", line3]);
    });

    it("parses body with link correctly", () => {
        const beforeBody = "check out this link ";
        const link = "https://www.google.com";
        const afterBody = " alright";
        const messageBody = `${beforeBody}${link}${afterBody}`;
        const renderedResult = parseMessageBody(messageBody, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedResult).toEqual([beforeBody, expect.anything(), afterBody]);
        expect(renderedLink.props).toMatchObject({ href: link, children: link });
    });

    it("adds missing protocol to link of message body", () => {
        const link = "www.google.com";
        const renderedResult = parseMessageBody(link, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedLink.props).toMatchObject({ href: `http://${link}`, children: link });
    });

    it("does not create link from invalid url in message body", () => {
        const messageBody = "hello www.google.invalidtopleveldomain";
        const renderedResult = parseMessageBody(messageBody, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedResult).toEqual([messageBody]);
        expect(renderedLink).toBeUndefined();
    });

    it("parses link that is any word following protocol", () => {
        const link = "http://anyrandomstring";
        const renderedResult = parseMessageBody(link, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedLink.props).toMatchObject({ href: link, children: link });
    });

    it("parses link with path", () => {
        const link = "http://www.google.com/root-path/page1#hashlink%20hello?arg1=123&arg2=321";
        const renderedResult = parseMessageBody(link, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedLink.props).toMatchObject({ href: link, children: link });
    });

    it("parses link with port and subdomains", () => {
        const link = "http://sub1.sub2.sub3.sub-4.google.com:8000/path-to-somewhere";
        const renderedResult = parseMessageBody(link, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedLink.props).toMatchObject({ href: link, children: link });
    });

    it("does not create a link with underscores in domain", () => {
        const messageBody = "www.go_ogle.com";
        const renderedResult = parseMessageBody(messageBody, false);
        const renderedLink = renderedResult[1] as ReactElement;

        expect(renderedResult).toEqual([messageBody]);
        expect(renderedLink).toBeUndefined();
    });
});
