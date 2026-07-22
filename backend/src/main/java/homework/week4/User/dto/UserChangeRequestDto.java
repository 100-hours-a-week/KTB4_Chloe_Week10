package homework.week4.User.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserChangeRequestDto {


    @NotBlank(message = "닉네임은 필수값입니다.")
    @Pattern(regexp = "[^\\s].{1,10}",
            message = "닉네임은 최대 10자입니다.")
    private String nickname;

    // 수정 화면은 이미 기존 사진이 있으므로 필수 아님 — 없으면 UserService.changeUser가 기존 이미지를 그대로 유지
    private MultipartFile profileImage;

}