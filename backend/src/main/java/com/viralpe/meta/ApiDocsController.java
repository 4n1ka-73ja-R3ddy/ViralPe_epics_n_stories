package com.viralpe.meta;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
// developed by anika teja reddy
public class ApiDocsController {

    @GetMapping("/scalar")
    public String scalar() {
        return "redirect:/scalar.html";
    }
}
