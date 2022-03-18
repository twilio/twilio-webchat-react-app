import { ReactElement } from "react";
import { Anchor } from "@twilio-paste/core/anchor";

const protocol = "((?:http|https|rtsp):\\/\\/)";
const domainAndSubdomains = "(?:(?:[a-zA-Z0-9][-]*)*[a-zA-Z0-9]\\.)+";
const genericTopLevelDomains =
    "aero|arpa|asia|app|" +
    "biz|buzz|" +
    "cat|com|coop|credit|" +
    "edu|" +
    "gov|" +
    "info|int|" +
    "jobs|" +
    "mil|mobi|museum|" +
    "name|net|" +
    "org|" +
    "pro|" +
    "tel|travel";
const countryTopLevelDomains =
    "a[cdefgilmnoqrstuwxz]|" +
    "b[abdefghijlmnoqrstvwyz]|" +
    "c[acdfghiklmnoruvwxyz]|" +
    "d[ejkmoz]|" +
    "e[ceghrstu]|" +
    "f[ijkmor]|" +
    "g[abdefghilmnpqrstuwy]|" +
    "h[kmnrtu]|" +
    "i[delmnoqrst]|" +
    "j[emop]|" +
    "k[eghimnprwyz]|" +
    "l[abcikrstuvy]|" +
    "m[acdefghklmnopqrstuvwxyz]|" +
    "n[acefgilopruz]|" +
    "om|" +
    "p[aefghklmnrstwy]|" +
    "qa|" +
    "r[eosuw]|" +
    "s[abcdeghijklmnorstuvxyz]|" +
    "t[cdfghjklmnoprtvwz]|" +
    "u[agkmsyz]|" +
    "v[aceginu]|" +
    "w[fs]|" +
    "y[etu]|" +
    "z[amw]";
const port = "(?:\\:\\d{1,5})?";
const path = '(?:[/?#][^\\s"]*)?';
const startOfMatchedUrl = "(?:\\b|^)";
const endOfMatchedUrl = "(?:\\b|$)";

// only captured group is the protocol, e.g. https://
const urlRegexString = `${startOfMatchedUrl}(?:${protocol}\\S+|(?:${protocol})?${domainAndSubdomains}(?:${genericTopLevelDomains}|${countryTopLevelDomains})${port}${path})${endOfMatchedUrl}`;
const urlRegex = new RegExp(urlRegexString, "gi");

export const parseMessageBody = (body: string, belongToCurrentUser: boolean) => {
    const renderedResult: Array<ReactElement | string> = [];

    const lineBreakRegexp = new RegExp(/[\n\r]/);
    const lines = body.split(lineBreakRegexp);
    lines.forEach((line) => {
        let index = 0;
        let regexResult;

        while ((regexResult = urlRegex.exec(line))) {
            // add all regular body text that comes before the url
            renderedResult.push(line.substring(index, regexResult.index));

            const [url, urlProtocol] = regexResult;
            const urlHref = urlProtocol ? url : `http://${url}`;
            renderedResult.push(
                <Anchor href={urlHref} key={index} variant={belongToCurrentUser ? "inverse" : "default"}>
                    {url}
                </Anchor>
            );
            index = regexResult.index + regexResult[0].length;
        }

        // add all regular body text that comes after the url
        if (index < line.length) {
            renderedResult.push(line.substring(index, line.length));
        }

        renderedResult.push("\n");
    });

    // remove the newline added after the last parsed line
    renderedResult.pop();

    return renderedResult;
};
