package com.example.restapi.file;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.Map;
import java.util.regex.Pattern;

@Component
public class HandHistoryAnalyzer {

    private static final Map<PokerSite, Pattern> SITE_PATTERNS = new EnumMap<>(PokerSite.class);
    static {
        SITE_PATTERNS.put(PokerSite.POKERSTARS, Pattern.compile("PokerStars Hand #", Pattern.CASE_INSENSITIVE));
        SITE_PATTERNS.put(PokerSite.COINPOKER, Pattern.compile("PokerMaster Hand #", Pattern.CASE_INSENSITIVE));
        SITE_PATTERNS.put(PokerSite.GGPOKER,    Pattern.compile("(?im)^Total\\s+pot\\s+[^\\n]*\\|\\s*Rake\\s+[^\\n]*\\|\\s*Jackpot\\s+[^\\n]*\\|\\s*Bingo\\s+[^\\n]*\\|\\s*Fortune\\s+[^\\n]*\\|\\s*Tax\\s+[^\\n]*$", Pattern.CASE_INSENSITIVE));

        SITE_PATTERNS.put(PokerSite.IPOKER,
                Pattern.compile("(?is)<\\\\?xml[^>]*>.*?<session\\\\b[\\\\s\\\\S]*?<game\\\\s+gamecode=\\\"\\\\d+\\\"", Pattern.CASE_INSENSITIVE));
    }
    public PokerSite determineSite(InputStream handHistoryStream) throws IOException {
        String text = readToString(handHistoryStream, StandardCharsets.UTF_8);
        if (text.indexOf('\uFFFD') >= 0) {
            text = readToString(handHistoryStream, Charset.forName("windows-1252"));
        }


        for (var e : SITE_PATTERNS.entrySet()) {
            if (e.getValue().matcher(text).find()) {
                return e.getKey();
            }
        }
        return PokerSite.UNKNOWN;
    }

    private String readToString(InputStream in, Charset cs) throws IOException {
        byte[] bytes = in.readAllBytes();
        return new String(bytes, cs);
    }

}
